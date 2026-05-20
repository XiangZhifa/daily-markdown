import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StatisticsService } from './statistics.service';
import { CurrentUser } from '../../common/decorators';

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('monthly')
  async getMonthly(
    @CurrentUser('id') userId: number,
    @Query('year') year: string,
    @Query('month') month?: string,
    @Query('startMonth') startMonth?: string,
    @Query('endMonth') endMonth?: string,
  ) {
    if (startMonth && endMonth) {
      return this.statisticsService.getMonthlyRangeStats(userId, +year, startMonth, endMonth);
    }
    return this.statisticsService.getMonthlyStats(userId, +year, month ? +month : undefined);
  }

  @Get('yearly')
  async getYearly(
    @CurrentUser('id') userId: number,
    @Query('year') year: string,
  ) {
    return this.statisticsService.getYearlyStats(userId, +year);
  }

  @Get('tags')
  async getTagStats(
    @CurrentUser('id') userId: number,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.statisticsService.getTagStats(userId, +year, +month);
  }
}