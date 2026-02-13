import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { Shipment } from '../../shipment/entities/shipment.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async generateInvoiceForShipment(shipment: Shipment): Promise<Invoice> {
    const existing = await this.invoiceRepository.findOne({ where: { shipment: { id: shipment.id } } });
    if (existing) return existing;

    const amount = Number(shipment.request.finalCost) || Number(shipment.request.preliminaryCost);
    const taxAmount = amount * 0.2; // Example 20% tax

    const invoice = this.invoiceRepository.create({
      invoiceNumber: `INV-${Date.now()}-${shipment.id.substring(0, 4).toUpperCase()}`,
      shipment: shipment,
      company: shipment.request.company,
      amount: amount,
      taxAmount: taxAmount,
      status: InvoiceStatus.DRAFT,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    });

    return this.invoiceRepository.save(invoice);
  }

  async markAsPaid(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    invoice.status = InvoiceStatus.PAID;
    invoice.paidDate = new Date();
    return this.invoiceRepository.save(invoice);
  }

  async findAll() {
    return this.invoiceRepository.find({ relations: ['company', 'shipment'] });
  }
}
