import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { createId } from '@paralleldrive/cuid2';

import { CasinoWalletEntity } from '../../wallet/entities/casino-wallet.entity';
import { CasinoGameSessionEntity } from '../../session/entities/casino-game-session.entity';
import {
  CasinoTransactionEntity,
  CasinoTransactionType,
} from '../../transaction/entities/casino-transaction.entity';

import {
  CasinoCreditRequestDto,
  CasinoCreditResponseDto,
  CasinoDebitRequestDto,
  CasinoDebitResponseDto,
  CasinoGetBalanceRequestDto,
  CasinoGetBalanceResponseDto,
  CasinoRollbackRequestDto,
  CasinoRollbackResponseDto,
} from '../dto/casino-callbacks.dto';

@Injectable()
export class CasinoService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(CasinoWalletEntity)
    private readonly wallets: Repository<CasinoWalletEntity>,

    @InjectRepository(CasinoGameSessionEntity)
    private readonly sessions: Repository<CasinoGameSessionEntity>,

    @InjectRepository(CasinoTransactionEntity)
    private readonly txs: Repository<CasinoTransactionEntity>,
  ) {}

  async getBalance(
    dto: CasinoGetBalanceRequestDto,
  ): Promise<CasinoGetBalanceResponseDto> {
    const session = await this.sessions.findOne({
      where: { providerSessionId: dto.providerSessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const wallet = await this.wallets.findOne({
      where: { id: session.walletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return { balance: String(wallet.balance), currency: wallet.currency };
  }

  async debit(dto: CasinoDebitRequestDto): Promise<CasinoDebitResponseDto> {
    const existing = await this.txs.findOne({
      where: { externalTransactionId: dto.transactionId },
    });
    if (existing?.responseCache)
      return existing.responseCache as CasinoDebitResponseDto;

    const session = await this.sessions.findOne({
      where: { providerSessionId: dto.providerSessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager
        .getRepository(CasinoWalletEntity)
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.id = :id', { id: session.walletId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const amount = BigInt(dto.amount);
      const current = BigInt(wallet.balance);
      if (current < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const next = current - amount;
      wallet.balance = next.toString();
      await manager.getRepository(CasinoWalletEntity).save(wallet);

      const response: CasinoDebitResponseDto = {
        ok: true,
        balance: wallet.balance,
        currency: wallet.currency,
      };

      const tx = manager.getRepository(CasinoTransactionEntity).create({
        id: createId(),
        walletId: wallet.id,
        type: CasinoTransactionType.DEBIT,
        amount: amount.toString(),
        externalTransactionId: dto.transactionId,
        providerRoundId: dto.roundId ?? null,
        responseCache: response,
      });

      await manager.getRepository(CasinoTransactionEntity).save(tx);

      return response;
    });
  }

  async credit(dto: CasinoCreditRequestDto): Promise<CasinoCreditResponseDto> {
    const existing = await this.txs.findOne({
      where: { externalTransactionId: dto.transactionId },
    });
    if (existing?.responseCache) {
      return existing.responseCache as CasinoCreditResponseDto;
    }

    const session = await this.sessions.findOne({
      where: { providerSessionId: dto.providerSessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager
        .getRepository(CasinoWalletEntity)
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.id = :id', { id: session.walletId })
        .getOne();

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const amount = BigInt(dto.amount);
      const next = BigInt(wallet.balance) + amount;

      wallet.balance = next.toString();
      await manager.getRepository(CasinoWalletEntity).save(wallet);

      const response: CasinoCreditResponseDto = {
        ok: true,
        balance: wallet.balance,
        currency: wallet.currency,
      };

      const tx = manager.getRepository(CasinoTransactionEntity).create({
        id: createId(),
        walletId: wallet.id,
        type: CasinoTransactionType.CREDIT,
        amount: amount.toString(),
        externalTransactionId: dto.transactionId,
        providerRoundId: dto.roundId ?? null,
        responseCache: response,
      });

      await manager.getRepository(CasinoTransactionEntity).save(tx);

      return response;
    });
  }

  async rollback(
    dto: CasinoRollbackRequestDto,
  ): Promise<CasinoRollbackResponseDto> {
    const existing = await this.txs.findOne({
      where: { externalTransactionId: dto.transactionId },
    });
    if (existing?.responseCache)
      return existing.responseCache as CasinoRollbackResponseDto;

    const session = await this.sessions.findOne({
      where: { providerSessionId: dto.providerSessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(CasinoWalletEntity);
      const txRepo = manager.getRepository(CasinoTransactionEntity);

      const wallet = await walletRepo
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.id = :id', { id: session.walletId })
        .getOne();
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const original = await txRepo.findOne({
        where: { externalTransactionId: dto.rollbackTransactionId },
      });

      if (!original) {
        const response: CasinoRollbackResponseDto = {
          ok: true,
          balance: String(wallet.balance),
          currency: wallet.currency,
          rolledBack: false,
        };

        const tomb = txRepo.create({
          id: createId(),
          walletId: wallet.id,
          type: CasinoTransactionType.ROLLBACK,
          amount: '0',
          externalTransactionId: dto.transactionId,
          providerRoundId: dto.roundId ?? null,
          responseCache: response,
        });

        await txRepo.save(tomb);
        return response;
      }

      if (original.type !== CasinoTransactionType.DEBIT) {
        throw new BadRequestException('Rollback allowed only for DEBIT');
      }

      if (original.providerRoundId) {
        const payout = await txRepo.findOne({
          where: {
            walletId: wallet.id,
            providerRoundId: original.providerRoundId,
            type: CasinoTransactionType.CREDIT,
          },
        });
        if (payout) {
          throw new BadRequestException('Rollback not allowed after payout');
        }
      }

      const refund = BigInt(original.amount);
      wallet.balance = (BigInt(wallet.balance) + refund).toString();
      await walletRepo.save(wallet);

      const response: CasinoRollbackResponseDto = {
        ok: true,
        balance: String(wallet.balance),
        currency: wallet.currency,
        rolledBack: true,
      };

      const rb = txRepo.create({
        id: createId(),
        walletId: wallet.id,
        type: CasinoTransactionType.ROLLBACK,
        amount: refund.toString(),
        externalTransactionId: dto.transactionId,
        providerRoundId: dto.roundId ?? original.providerRoundId ?? null,
        responseCache: response,
      });

      await txRepo.save(rb);

      return response;
    });
  }
}
