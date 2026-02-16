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

interface TeamInvitationEmailProps {
  invitedEmail: string;
  inviterName: string;
  organizationName: string;
  jobTitle?: string;
  inviteUrl: string;
}

export const TeamInvitationEmail = ({
  invitedEmail,
  inviterName = 'Sarah Johnson',
  organizationName = 'Acme Corp',
  jobTitle,
  inviteUrl = 'https://app.dealpress.com/signup',
}: TeamInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {organizationName} on DealPress</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're Invited!</Heading>

          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join <strong>{organizationName}</strong> on DealPress.
          </Text>

          {jobTitle && (
            <Text style={text}>
              Role: <strong>{jobTitle}</strong>
            </Text>
          )}

          <Section style={inviteCard}>
            <Text style={cardText}>
              DealPress helps teams streamline their approval workflows, track deal progress, and improve margin visibility.
            </Text>
            <Text style={cardText}>
              Get started by creating your account below.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteUrl}>
              Join {organizationName}
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            If you weren't expecting this invitation, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            DealPress - Deal approvals, made simple.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TeamInvitationEmail;

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

const text = {
  color: '#1d1d1f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const inviteCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: '18px',
  padding: '24px',
  margin: '24px 0',
};

const cardText = {
  color: '#1d1d1f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
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
