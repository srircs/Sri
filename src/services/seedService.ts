import { Lead, UserProfile } from '../types';
import { createLead } from './leadsService';
import { logCallActivity } from './callActivityService';
import { createStaffAccount, getAllStaff } from './staffService';

export async function seedInitialSriGroupsData(adminUser: UserProfile): Promise<void> {
  // Check if staff already exist
  const existingStaff = await getAllStaff();
  let staffA = existingStaff[0];
  let staffB = existingStaff[1];

  if (!staffA) {
    staffA = await createStaffAccount({
      username: 'karthik',
      displayName: 'Karthik Selvam',
      email: 'karthik@srigroups.com',
      phone: '+91 98421 23456',
      password: 'staffpassword123',
      adminUid: adminUser.uid,
      adminName: adminUser.displayName,
    });
  }

  if (!staffB) {
    staffB = await createStaffAccount({
      username: 'priya',
      displayName: 'Priya Sundaram',
      email: 'priya@srigroups.com',
      phone: '+91 97512 87654',
      password: 'staffpassword123',
      adminUid: adminUser.uid,
      adminName: adminUser.displayName,
    });
  }

  const sampleLeads = [
    {
      companyName: 'Apex Precision Tools Ltd',
      contactPerson: 'S. Chandrasekar',
      mobileNumber: '+91 98401 54321',
      alternatePhone: '0422-2678912',
      email: 'procurement@apexprecision.in',
      businessCategory: 'Manufacturing & Industrial',
      cityArea: 'Coimbatore - SIDCO Kurichi',
      fullAddress: 'Plot 45, Phase 2, SIDCO Industrial Estate, Coimbatore - 641021',
      website: 'www.apexprecision.in',
      leadSource: 'IndiaMART' as const,
      requirement: 'Industrial cutting tools and CNC machining tooling packages for 12 machines.',
      priority: 'High' as const,
      assignedStaffId: staffA.uid,
      assignedStaffName: staffA.displayName,
      status: 'Requirement Collected',
      additionalNotes: 'Large factory expansion planned for Q4. Looking for vendor with monthly supply contract.',
    },
    {
      companyName: 'Sri Balaji Construction Corp',
      contactPerson: 'K. Balaji',
      mobileNumber: '+91 94432 98765',
      alternatePhone: '044-22446688',
      email: 'k.balaji@balajiconstruct.com',
      businessCategory: 'Construction & Infrastructure',
      cityArea: 'Chennai - Guindy',
      fullAddress: 'No. 12, GST Road, Guindy, Chennai - 600032',
      website: 'www.balajiconstruct.com',
      leadSource: 'Referral' as const,
      requirement: 'Structural fabrication steel supplies and turnkey site installation materials.',
      priority: 'High' as const,
      assignedStaffId: staffA.uid,
      assignedStaffName: staffA.displayName,
      status: 'Call Connected',
      additionalNotes: 'Commercial tower project near Velachery. High priority quote needed by Thursday.',
    },
    {
      companyName: 'Kaveri Polymers & Packaging',
      contactPerson: 'Deepak Narayanan',
      mobileNumber: '+91 98940 11223',
      alternatePhone: '',
      email: 'deepak@kaveripolymers.co.in',
      businessCategory: 'Retail & Wholesale Distribution',
      cityArea: 'Madurai - Mattuthavani',
      fullAddress: '24 Bypass Ring Road, Mattuthavani, Madurai - 625007',
      website: '',
      leadSource: 'Cold Call' as const,
      requirement: 'Corrugated boxes and protective packaging wrapping rolls.',
      priority: 'Medium' as const,
      assignedStaffId: staffB.uid,
      assignedStaffName: staffB.displayName,
      status: 'Interested',
      additionalNotes: 'Trial batch samples required before issuing quarterly purchase order.',
    },
    {
      companyName: 'Greenfield Agri Logistics',
      contactPerson: 'M. Anandhan',
      mobileNumber: '+91 96291 77889',
      alternatePhone: '',
      email: 'anandhan@greenfieldlogistics.in',
      businessCategory: 'Logistics & Supply Chain',
      cityArea: 'Tiruppur - Avinashi Road',
      fullAddress: 'Door 88, Near Old Bus Stand, Avinashi Road, Tiruppur - 641602',
      website: 'www.greenfieldlogistics.in',
      leadSource: 'Website' as const,
      requirement: 'Cold storage insulated panels and refrigeration temperature tracking units.',
      priority: 'Low' as const,
      assignedStaffId: staffB.uid,
      assignedStaffName: staffB.displayName,
      status: 'New Lead',
      additionalNotes: 'Submitted online enquiry form through website contact page.',
    },
    {
      companyName: 'Vasantham Textiles & Garments',
      contactPerson: 'R. Murugesan',
      mobileNumber: '+91 98433 44556',
      alternatePhone: '0424-2223344',
      email: 'murugesan@vasanthamtextiles.com',
      businessCategory: 'Manufacturing & Industrial',
      cityArea: 'Erode - Perundurai SIPCOT',
      fullAddress: 'Plot 102, SIPCOT Industrial Growth Estate, Perundurai, Erode',
      website: 'www.vasanthamtextiles.com',
      leadSource: 'Exhibition' as const,
      requirement: 'Effluent treatment pump accessories and flow control valves.',
      priority: 'High' as const,
      assignedStaffId: staffA.uid,
      assignedStaffName: staffA.displayName,
      status: 'Converted',
      additionalNotes: 'Advance payment received. PO-2026-SG-901 confirmed.',
    },
  ];

  for (const item of sampleLeads) {
    const lead = await createLead({
      leadData: item,
      adminUser,
    });

    // Add a sample call activity for contacted leads
    if (item.status !== 'New Lead') {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      await logCallActivity({
        lead,
        staffUser: item.assignedStaffId === staffA.uid ? staffA : staffB,
        callData: {
          callDateTime: new Date().toISOString().slice(0, 16),
          callOutcome: item.status === 'Converted' ? 'Connected - Lead Converted' : 'Connected - Requirement Collected',
          customerResponse: 'Client is keen to finalize and requested our quotation with tax breakdown.',
          discussionSummary: `Spoke directly with ${item.contactPerson}. Detailed technical specs recorded.`,
          customerRequirement: item.requirement,
          interestLevel: item.status === 'Converted' ? 'High' : 'High',
          updatedStatus: item.status,
          nextFollowUpDate: item.status === 'Converted' ? '' : tomorrow,
          nextAction: item.status === 'Converted' ? 'Send invoice and delivery dispatch schedule' : 'Send proposal document via WhatsApp & email',
          additionalNotes: 'Initial discovery call went very positively.',
        },
      });
    }
  }
}
