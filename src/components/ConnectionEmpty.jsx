import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ConnectionEmpty({ Icon }) {
  return (
    <div className="connect-empty">
      <div className="empty-illustration">
        <div className="empty-icon-circle"><Icon size={28} /></div>
        <span className="spark spark-one">✦</span>
        <span className="spark spark-two">✧</span>
        <span className="empty-orbit" />
      </div>
      <div className="empty-eyebrow">YOUR WORKSPACE IS READY</div>
      <h3>Let’s bring your Salesforce data in.</h3>
      <p>
        Connect your Salesforce org securely to start browsing, creating<br className="desktop-only" />
        {' '}and managing records from one place.
      </p>
      <a className="connect-main" href="/auth/login">
        <ExternalLink size={16} /> Log in with Salesforce <ArrowRight size={15} />
      </a>
      <div className="secure-note"><ShieldCheck size={14} /> Secure OAuth 2.0 authentication</div>
    </div>
  );
}
