import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AuraFarmer } from './entities/aura-farmer.entity';
import { AuraFarmerAddReq } from './entities/aura-farmer-add-req.entity';
import { DataSource } from 'typeorm';
import { AuraFarmShowcase } from './entities/aura-farm-showcase.entity';
import { AuraShowcaseSubmission } from './entities/aura-showcase-submission.entity';

@Injectable()
export class AuraFarmerService {
  constructor(
    @InjectRepository(AuraFarmer)
    private auraFarmerRepository: Repository<AuraFarmer>,
    @InjectRepository(AuraFarmerAddReq)
    private auraFarmerAddReqRepository: Repository<AuraFarmerAddReq>,
    @InjectRepository(AuraFarmShowcase)
    private auraFarmShowcaseRepository: Repository<AuraFarmShowcase>,
    @InjectRepository(AuraShowcaseSubmission)
    private auraShowcaseSubmissionRepository: Repository<AuraShowcaseSubmission>,
    private dataSource: DataSource,
  ) {}

  findAll(): Promise<AuraFarmer[]> {
    try {
    return this.dataSource.query(`
      SELECT
        auraFarmerId,
        name,
        origin,
        characterAvatar,
        description,
        votes,
        createdAt,
        DENSE_RANK() OVER (ORDER BY votes DESC) AS rank
      FROM aura_farmer
      ORDER BY votes DESC;
    `);
    } catch(error) {
      throw error;
    }
  }

  findOne(id: number): Promise<AuraFarmer | null> {
    return this.auraFarmerRepository.findOneBy({ auraFarmerId: id });
  }
  
  async requestAddingAuraFarmer(auraFarmerAddReq: Partial<AuraFarmerAddReq>): Promise<AuraFarmerAddReq> {
    const existingAuraFarmerAddReq = await this.auraFarmerAddReqRepository.findOneBy({ name: Like(`%${auraFarmerAddReq.name}%`) });
    if (existingAuraFarmerAddReq) {
      existingAuraFarmerAddReq.requestCount++;
      return this.auraFarmerAddReqRepository.save(existingAuraFarmerAddReq);
    } 
    return this.auraFarmerAddReqRepository.save(auraFarmerAddReq);
  }

  async updateVote(auraFarmerId: number): Promise<AuraFarmer> {
    try {
      const auraFarmer = await this.findOne(auraFarmerId);
      if (!auraFarmer) {
        throw new Error('Aura Farmer not found');
      }
      auraFarmer.votes += 1;
      return this.auraFarmerRepository.save(auraFarmer);
    } catch(error) {
      throw error;
    }
  }

  async unvoteAuraFarmer(auraFarmerId: number): Promise<AuraFarmer> {
    try {
      const auraFarmer = await this.findOne(auraFarmerId);
      if (!auraFarmer) {
        throw new Error('Aura Farmer not found');
      }
      auraFarmer.votes -= 1;
      return this.auraFarmerRepository.save(auraFarmer);
    } catch(error) {
      throw error;
    }
  }

  async getAuraFarmShowcase(auraFarmerId: number): Promise<AuraFarmShowcase[]> {
    try {
      return this.auraFarmShowcaseRepository.find({ where: { auraFarmerId } });
    } catch(error) {
      throw error;
    }
  }

  async submitAuraFarmShowcase(auraFarmerId: number, auraFarmShowcase: Partial<AuraShowcaseSubmission>): Promise<AuraShowcaseSubmission> {
    try {
      const auraFarmer = await this.findOne(auraFarmerId);
      if (!auraFarmer) {
        throw new Error('Aura Farmer not found');
      }
      return this.auraShowcaseSubmissionRepository.save({
        ...auraFarmShowcase,
        auraFarmerId
      });
    } catch(error) {
      throw error;
    }
  }

  async getPendingSubmissions(): Promise<any[]> {
    try {
      return await this.auraShowcaseSubmissionRepository
        .createQueryBuilder('submission')
        .leftJoin(AuraFarmer, 'farmer', 'farmer.auraFarmerId = submission.auraFarmerId')
        .select([
          'submission.auraShowcaseSubmissionId',
          'submission.auraFarmerId',
          'submission.showcaseYoutubeUrl',
          'submission.submittedBy',
          'submission.createdAt',
          'submission.status',
          'farmer.name',
          'farmer.characterAvatar'
        ])
        .where('submission.status = :status', { status: 'PENDING' })
        .orderBy('submission.createdAt', 'DESC')
        .getRawMany()
        .then(results => results.map(r => ({
          auraShowcaseSubmissionId: r.submission_auraShowcaseSubmissionId,
          auraFarmerId: r.submission_auraFarmerId,
          showcaseYoutubeUrl: r.submission_showcaseYoutubeUrl,
          submittedBy: r.submission_submittedBy,
          createdAt: r.submission_createdAt,
          status: r.submission_status,
          farmerName: r.farmer_name,
          farmerAvatar: r.farmer_characterAvatar
        })));
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      throw new BadRequestException('Failed to fetch pending submissions');
    }
  }

  async approveSubmission(submissionId: number): Promise<AuraFarmShowcase> {
    try {
      const submission = await this.auraShowcaseSubmissionRepository.findOneBy({ 
        auraShowcaseSubmissionId: submissionId 
      });
      
      if (!submission) {
        throw new NotFoundException(`Submission with ID ${submissionId} not found`);
      }
      
      if (submission.status !== 'PENDING') {
        throw new BadRequestException(`Submission already ${submission.status.toLowerCase()}`);
      }
      
      // Create showcase entry
      const showcase = await this.auraFarmShowcaseRepository.save({
        auraFarmerId: submission.auraFarmerId,
        showcaseYoutubeUrl: submission.showcaseYoutubeUrl,
        addedBy: submission.submittedBy
      });
      
      // Update submission status
      submission.status = 'APPROVED';
      await this.auraShowcaseSubmissionRepository.save(submission);
      
      return showcase;
    } catch (error) {
      console.error('Error approving submission:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to approve submission');
    }
  }

  async deleteSubmission(submissionId: number): Promise<void> {
    try {
      const submission = await this.auraShowcaseSubmissionRepository.findOneBy({ 
        auraShowcaseSubmissionId: submissionId 
      });
      
      if (!submission) {
        throw new NotFoundException(`Submission with ID ${submissionId} not found`);
      }
      
      await this.auraShowcaseSubmissionRepository.remove(submission);
    } catch (error) {
      console.error('Error deleting submission:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete submission');
    }
  }

  async getPendingFarmerRequests(): Promise<AuraFarmerAddReq[]> {
    try {
      return await this.auraFarmerAddReqRepository.find();
    } catch (error) {
      console.error('Error fetching pending farmer requests:', error);
      throw new BadRequestException('Failed to fetch pending farmer requests');
    }
  }

  async approveFarmerRequest(requestId: number, characterAvatar: string): Promise<AuraFarmer> {
    try {
      const request = await this.auraFarmerAddReqRepository.findOneBy({ 
        auraFarmerAddReqId: requestId 
      });
      
      if (!request) {
        throw new NotFoundException(`Request with ID ${requestId} not found`);
      }
      
      // Create the aura farmer
      const auraFarmer = await this.auraFarmerRepository.save({
        name: request.name,
        origin: request.origin,
        description: request.description,
        characterAvatar: characterAvatar,
        votes: 0
      });
      
      // Delete the request
      await this.auraFarmerAddReqRepository.remove(request);
      
      return auraFarmer;
    } catch (error) {
      console.error('Error approving farmer request:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to approve farmer request');
    }
  }

  async deleteFarmerRequest(requestId: number): Promise<void> {
    try {
      const request = await this.auraFarmerAddReqRepository.findOneBy({ 
        auraFarmerAddReqId: requestId 
      });
      
      if (!request) {
        throw new NotFoundException(`Request with ID ${requestId} not found`);
      }
      
      await this.auraFarmerAddReqRepository.remove(request);
    } catch (error) {
      console.error('Error deleting farmer request:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete farmer request');
    }
  }
}
