import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AuraFarmerService } from './aura-farmer.service';
import { AuraFarmer } from './entities/aura-farmer.entity';
import { AuraFarmShowcase } from './entities/aura-farm-showcase.entity';
import { AuraShowcaseSubmission } from './entities/aura-showcase-submission.entity';

@Controller('aura-farmer')
export class AuraFarmerController {
  constructor(private readonly auraFarmerService: AuraFarmerService) {}

  @Get()
  findAll() {
    return this.auraFarmerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auraFarmerService.findOne(+id);
  }


  @Put()
  update(@Body() auraFarmer: Partial<AuraFarmer>) {
    return this.auraFarmerService.create(auraFarmer);
  }

  @UseGuards(ThrottlerGuard)
  @Post(':id/update-vote')
  updateVote(@Param('id') id: string) {
    return this.auraFarmerService.updateVote(+id);
  }

  @UseGuards(ThrottlerGuard)
  @Post(':id/unvote')
  unvote(@Param('id') id: string) {
    return this.auraFarmerService.unvoteAuraFarmer(+id);
  }

  @Post('request-add') 
  requestAddingAuraFarmer(@Body() auraFarmer: Partial<AuraFarmer>) {
    return this.auraFarmerService.requestAddingAuraFarmer(auraFarmer);
  }

  @Get(':id/showcase')
  getAuraFarmShowcase(@Param('id') id: string) {
    return this.auraFarmerService.getAuraFarmShowcase(+id);
  } 

  @Post(':id/showcase-submit')
  submitAuraFarmShowcase(@Param('id') id: string, @Body() auraFarmShowcase: Partial<AuraShowcaseSubmission>) {
    return this.auraFarmerService.submitAuraFarmShowcase(+id, auraFarmShowcase);
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/submissions')
  getPendingSubmissions() {
    return this.auraFarmerService.getPendingSubmissions();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/approve/:id')
  approveSubmission(@Param('id') id: string) {
    return this.auraFarmerService.approveSubmission(+id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/delete/:id')
  deleteSubmission(@Param('id') id: string) {
    return this.auraFarmerService.deleteSubmission(+id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/farmer-requests')
  getPendingFarmerRequests() {
    return this.auraFarmerService.getPendingFarmerRequests();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/farmer-requests/approve/:id')
  approveFarmerRequest(@Param('id') id: string, @Body() body: { characterAvatar: string }) {
    return this.auraFarmerService.approveFarmerRequest(+id, body.characterAvatar);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/farmer-requests/delete/:id')
  deleteFarmerRequest(@Param('id') id: string) {
    return this.auraFarmerService.deleteFarmerRequest(+id);
  }
}
