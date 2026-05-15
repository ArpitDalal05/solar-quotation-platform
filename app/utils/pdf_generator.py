"""
PDF generation for quotations
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from datetime import datetime
import os

class QuotationPDFGenerator:
    """Generate PDF quotations"""
    
    @staticmethod
    def generate_quotation_pdf(quotation_data, user_data, calculation_data, output_path):
        """
        Generate a professional quotation PDF
        
        Args:
            quotation_data: Quotation model data
            user_data: User information
            calculation_data: Calculation parameters
            output_path: Path to save PDF
        """
        # Create PDF document
        doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=0.5*inch, 
                                leftMargin=0.5*inch, topMargin=0.75*inch, 
                                bottomMargin=0.75*inch)
        
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1f77d4'),
            spaceAfter=30,
            alignment=1  # Center
        )
        story.append(Paragraph("SOLAR POWER SYSTEM QUOTATION", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Quotation details header
        header_data = [
            ['Quotation No:', quotation_data['quotation_number'], 'Date:', datetime.now().strftime('%Y-%m-%d')],
            ['Status:', quotation_data['status'].upper(), 'Feasible:', 'YES' if quotation_data['feasible'] else 'NO']
        ]
        header_table = Table(header_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Customer Information
        story.append(Paragraph("CUSTOMER INFORMATION", styles['Heading2']))
        customer_data = [
            ['Name:', user_data['name']],
            ['Email:', user_data['email']],
            ['Phone:', user_data['phone']],
            ['Location:', user_data['location']]
        ]
        customer_table = Table(customer_data, colWidths=[1.5*inch, 3.5*inch])
        customer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f4f8')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(customer_table)
        story.append(Spacer(1, 0.3*inch))
        
        # System Specifications
        story.append(Paragraph("SYSTEM SPECIFICATIONS", styles['Heading2']))
        specs_data = [
            ['Parameter', 'Value'],
            ['System Capacity', f"{quotation_data['system_capacity_kw']} kW"],
            ['Number of Panels', f"{quotation_data['number_of_panels']} pcs"],
            ['Space Utilization', f"{quotation_data['space_utilization_percent']}%"],
            ['Location', calculation_data['location']],
            ['Installation Type', calculation_data['installation_type']],
            ['Grid Type', calculation_data['grid_type']],
            ['Roof Type', calculation_data['roof_type']]
        ]
        specs_table = Table(specs_data, colWidths=[2.5*inch, 2.5*inch])
        specs_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f77d4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
        ]))
        story.append(specs_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Cost Breakdown
        story.append(Paragraph("COST BREAKDOWN", styles['Heading2']))
        cost_data = [
            ['Description', 'Amount (INR)'],
            ['Base System Cost', f"₹{quotation_data['cost_breakdown'].get('base_cost', 0):,.2f}"],
            ['Installation Cost', f"₹{quotation_data['cost_breakdown'].get('installation_cost', 0):,.2f}"],
            ['Additional Cost', f"₹{quotation_data['cost_breakdown'].get('additional_cost', 0):,.2f}"],
            ['Grid Connection Cost', f"₹{quotation_data['cost_breakdown'].get('grid_factor_cost', 0):,.2f}"],
            ['Subtotal', f"₹{quotation_data['cost_breakdown'].get('subtotal', 0):,.2f}"],
            ['GST (18%)', f"₹{quotation_data['cost_breakdown'].get('gst', 0):,.2f}"],
        ]
        cost_table = Table(cost_data, colWidths=[3*inch, 2*inch])
        cost_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f77d4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
        ]))
        story.append(cost_table)
        story.append(Spacer(1, 0.1*inch))
        
        # Total Cost (Highlighted)
        total_data = [
            ['TOTAL SYSTEM COST', f"₹{quotation_data['total_cost']:,.2f}"]
        ]
        total_table = Table(total_data, colWidths=[3*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ff6b35')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'RIGHT'),
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
        ]))
        story.append(total_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Performance Metrics
        story.append(Paragraph("PERFORMANCE METRICS", styles['Heading2']))
        perf_data = [
            ['Annual Energy Generation', f"{quotation_data['annual_generation_kwh']:,.0f} kWh"],
            ['Annual Savings', f"₹{quotation_data['annual_savings']:,.2f}"],
            ['Payback Period', f"{quotation_data['payback_period_years']:.1f} years"],
            ['Warranty', '10-25 years (as per manufacturer)']
        ]
        perf_table = Table(perf_data, colWidths=[2.5*inch, 2.5*inch])
        perf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f4f8')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(perf_table)
        
        # Build PDF
        doc.build(story)
        return output_path
