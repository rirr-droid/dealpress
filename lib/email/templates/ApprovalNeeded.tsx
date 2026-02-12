import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ApprovalNeededEmailProps {
  approverName: string;
  requesterName: string;
  dealName: string;
  dealAmount?: number;
  reason?: string;
  stepName: string;
  requestUrl: string;
}

export const ApprovalNeededEmail = ({
  approverName = 'Sarah',
  requesterName = 'Michael Park',
  dealName = 'Acme Corp - Enterprise License',
  dealAmount = 85000,
  reason = 'Major account, expedited approval needed for Q1 close',
  stepName = 'VP Approval',
  requestUrl = 'https://app.dealpress.com/requests/123',
}: ApprovalNeededEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Action required: {dealName} needs your approval</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Approval Needed</Heading>

          <Text style={text}>Hi {approverName},</Text>

          <Text style={text}>
            <strong>{requesterName}</strong> has submitted an approval request that requires your review.
          </Text>

          <Section style={dealCard}>
            <Heading as="h2" style={h2}>
              {dealName}
            </Heading>
            {dealAmount && (
              <Text style={dealAmount_}>
                ${dealAmount.toLocaleString()}
              </Text>
            )}
            <Text style={stepBadge}>{stepName}</Text>
            {reason && (
              <Text style={reasonText}>
                <strong>Reason:</strong> {reason}
              </Text>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={requestUrl}>
              Review Request
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You can also approve or reject directly from this email if one-click approvals are enabled in your settings.
          </Text>

          <Text style={footer}>
            DealPress - Deal approvals, made simple.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ApprovalNeededEmail;

const main = {
  backgroundColor: '#f5f5f7',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1d1d1f',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 30px',
  padding: '0',
  lineHeight: '1.2',
};

const h2 = {
  color: '#1d1d1f',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 10px',
  padding: '0',
};

const text = {
  color: '#1d1d1f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const dealCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: '18px',
  padding: '24px',
  margin: '24px 0',
};

const dealAmount_ = {
  color: '#0071e3',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 10px',
};

const stepBadge = {
  backgroundColor: '#ff9500',
  color: '#ffffff',
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 0 16px',
};

const reasonText = {
  color: '#1d1d1f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0 0',
  padding: '16px',
  backgroundColor: '#f5f5f7',
  borderRadius: '12px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0071e3',
  borderRadius: '24px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '32px 0',
};

const footer = {
  color: '#86868b',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '12px 0',
};
