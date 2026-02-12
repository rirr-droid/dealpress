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

interface RequestRejectedEmailProps {
  requesterName: string;
  approverName: string;
  dealName: string;
  dealAmount?: number;
  comments: string;
  requestUrl: string;
}

export const RequestRejectedEmail = ({
  requesterName = 'Michael Park',
  approverName = 'Sarah Chen',
  dealName = 'Acme Corp - Enterprise License',
  dealAmount = 85000,
  comments = 'Budget concerns, need more justification for this amount.',
  requestUrl = 'https://app.dealpress.com/requests/123',
}: RequestRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>❌ Rejected: {dealName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={rejectedBanner}>
            <Heading style={h1}>❌ Request Rejected</Heading>
          </Section>

          <Text style={text}>Hi {requesterName},</Text>

          <Text style={text}>
            Your approval request has been <strong>rejected</strong> by {approverName}.
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
            <Text style={statusBadge}>Rejected</Text>
            <Text style={commentText}>
              <strong>Reason for rejection:</strong><br />
              {comments}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={requestUrl}>
              View Details
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You can review the feedback and submit a new request if needed.
          </Text>

          <Text style={footer}>
            DealPress - Deal approvals, made simple.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RequestRejectedEmail;

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

const rejectedBanner = {
  backgroundColor: '#ff3b30',
  borderRadius: '18px',
  padding: '24px',
  margin: '0 0 30px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
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

const statusBadge = {
  backgroundColor: '#ff3b30',
  color: '#ffffff',
  padding: '6px 12px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  display: 'inline-block',
  margin: '0 0 16px',
};

const commentText = {
  color: '#1d1d1f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0 0',
  padding: '16px',
  backgroundColor: '#fff5f4',
  borderRadius: '12px',
  border: '1px solid #ffcccb',
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
