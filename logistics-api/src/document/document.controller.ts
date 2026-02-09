import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../auth/enums/role-name.enum';
import { Shipment } from '../shipment/entities/shipment.entity'; // For type hinting

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (createDocumentDto.type && typeof createDocumentDto.type === 'string') {
      createDocumentDto.type = createDocumentDto.type.toUpperCase() as any;
    }

    if (!createDocumentDto.shipmentId) {
      throw new BadRequestException(
        'Document must be associated with a Shipment',
      );
    }

    return this.documentService.create(file, createDocumentDto);
  }

  @Get(':id')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  async downloadFile(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const document = await this.documentService.findOne(id, req.user);
    const filePath = await this.documentService.getFilePath(id);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
    });
    res.sendFile(filePath);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.LOGISTICIAN)
  async deleteFile(@Param('id') id: string, @Req() req) {
    await this.documentService.delete(id, req.user);
    return { message: 'Document deleted successfully' };
  }

  @Get('by-shipment/:shipmentId')
  @Roles(RoleName.CLIENT, RoleName.LOGISTICIAN, RoleName.ADMIN)
  async getDocumentsByShipment(
    @Param('shipmentId') shipmentId: string,
    @Req() req,
  ) {
    return this.documentService.findByShipmentId(shipmentId, req.user);
  }
}
