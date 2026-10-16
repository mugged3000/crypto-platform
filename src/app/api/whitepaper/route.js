import { NextResponse } from 'next/server';

// Returns the white paper as inline HTML that the browser renders
// Users can print to PDF using browser's built-in print function
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VAULTEX — White Paper</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #1a1a2e;
      line-height: 1.7;
    }

    @media print {
      .no-print { display: none; }
      body { background: white; }
      .page-break { page-break-before: always; }
    }

    .cover {
      background: linear-gradient(135deg, #0a0a0f 0%, #16162a 100%);
      color: white;
      padding: 80px 60px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .cover-logo {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #c9a84c;
    }

    .cover-title {
      font-size: 52px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 20px;
    }

    .cover-subtitle {
      font-size: 18px;
      color: #9898b8;
      max-width: 500px;
      margin-bottom: 40px;
    }

    .cover-meta {
      font-size: 13px;
      color: #5a5a78;
    }

    .cover-gold-line {
      width: 60px;
      height: 3px;
      background: #c9a84c;
      margin: 24px 0;
    }

    .content {
      max-width: 800px;
      margin: 0 auto;
      padding: 60px 40px;
    }

    h1 {
      font-size: 32px;
      font-weight: 800;
      color: #0a0a0f;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      margin-top: 48px;
      padding-top: 48px;
      border-top: 2px solid #f0f0f0;
    }

    h1:first-child { border-top: none; margin-top: 0; padding-top: 0; }

    h2 {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 32px 0 12px;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #c9a84c;
      margin: 24px 0 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    p {
      font-size: 15px;
      color: #444;
      margin-bottom: 16px;
      line-height: 1.8;
    }

    .highlight-box {
      background: #f8f7ff;
      border-left: 4px solid #c9a84c;
      padding: 20px 24px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }

    .highlight-box p { margin: 0; color: #333; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 14px;
    }

    th {
      background: #0a0a0f;
      color: #c9a84c;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #444;
    }

    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #fafafa; }

    .toc { 
      background: #f8f8f8; 
      padding: 32px; 
      border-radius: 12px; 
      margin: 32px 0; 
    }

    .toc h2 { margin-top: 0; }

    .toc ol { padding-left: 20px; }

    .toc li {
      font-size: 15px;
      color: #444;
      padding: 4px 0;
    }

    .toc li span {
      color: #c9a84c;
      font-weight: 600;
    }

    .disclaimer {
      background: #fff8e1;
      border: 1px solid #f0c040;
      padding: 20px 24px;
      border-radius: 8px;
      margin-top: 40px;
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }

    .print-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: linear-gradient(135deg, #c9a84c, #a8722a);
      color: #0a0a0f;
      border: none;
      padding: 14px 24px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(201,168,76,0.4);
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 100;
      font-family: 'Inter', sans-serif;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }

    .stat-box {
      background: #f8f7ff;
      border: 1px solid #e8e8f0;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }

    .stat-num {
      font-size: 28px;
      font-weight: 800;
      color: #c9a84c;
      letter-spacing: -0.02em;
    }

    .stat-label {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
      font-weight: 500;
    }
  </style>
</head>
<body>

  <!-- Print button -->
  <button class="print-btn no-print" onclick="window.print()">
    ⬇ Download PDF
  </button>

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-logo">VAULTEX</div>
    <div>
      <div style="font-size:13px;color:#5a5a78;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:16px">
        Official White Paper — Version 1.0
      </div>
      <div class="cover-title">
        The Future of<br>Digital Investment
      </div>
      <div class="cover-gold-line"></div>
      <div class="cover-subtitle">
        A transparent, secure, and rewarding crypto investment platform 
        built for a global generation of investors.
      </div>
      <div class="cover-meta">
        Published: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;·&nbsp;
        VAULTEX Investment Ltd &nbsp;·&nbsp;
        contact@vaultex.com
      </div>
    </div>
    <div style="font-size:12px;color:#3a3a52">
      This document is for informational purposes only and does not constitute financial advice.
    </div>
  </div>

  <!-- Content -->
  <div class="content">

    <!-- Table of Contents -->
    <div class="toc">
      <h2>Table of Contents</h2>
      <ol>
        <li><span>1.</span> Executive Summary</li>
        <li><span>2.</span> The Problem We Solve</li>
        <li><span>3.</span> Our Solution — VAULTEX Platform</li>
        <li><span>4.</span> Investment Plans</li>
        <li><span>5.</span> How It Works</li>
        <li><span>6.</span> Security & Transparency</li>
        <li><span>7.</span> Referral Program</li>
        <li><span>8.</span> Team & Company</li>
        <li><span>9.</span> Legal & Compliance</li>
        <li><span>10.</span> Disclaimer</li>
      </ol>
    </div>

    <!-- Section 1 -->
    <h1>1. Executive Summary</h1>
    <p>
      VAULTEX is a premier digital investment platform that bridges the gap between 
      cryptocurrency markets and everyday investors. Our mission is to democratize 
      wealth generation by providing structured, transparent, and high-yield investment 
      opportunities backed by professional asset management.
    </p>

    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-num">$48M+</div>
        <div class="stat-label">Total Invested</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">12,400+</div>
        <div class="stat-label">Active Investors</div>
      </div>
      <div class="stat-box">
        <div class="stat-num">18.5%</div>
        <div class="stat-label">Avg. Return Rate</div>
      </div>
    </div>

    <div class="highlight-box">
      <p>
        VAULTEX offers investment plans with returns ranging from 5% to 35%, 
        with durations from 30 to 180 days — making it accessible to both new 
        and experienced investors worldwide.
      </p>
    </div>

    <!-- Section 2 -->
    <h1>2. The Problem We Solve</h1>
    <p>
      Traditional investment platforms are plagued by high barriers to entry, 
      complex interfaces, lack of transparency, and slow processing times. 
      Meanwhile, the cryptocurrency market — despite its enormous potential — 
      remains inaccessible and intimidating to the average investor.
    </p>
    <p>
      Most people want to grow their wealth but lack:
    </p>
    <ul style="margin: 0 0 16px 24px; color: #444; font-size: 15px; line-height: 2;">
      <li>Access to professional investment vehicles</li>
      <li>Time to actively manage crypto portfolios</li>
      <li>Trust in unregulated platforms</li>
      <li>Simple and transparent processes</li>
    </ul>

    <!-- Section 3 -->
    <h1>3. Our Solution — VAULTEX Platform</h1>
    <p>
      VAULTEX solves these problems by offering a fully managed investment experience. 
      Users simply choose a plan, make a deposit via cryptocurrency, and watch 
      their investment grow — without needing to understand the complexities 
      of trading or market analysis.
    </p>

    <h2>Key Features</h2>

    <h3>Simple Onboarding</h3>
    <p>
      Creating an account takes less than 2 minutes. Email verification ensures 
      platform security while keeping the process frictionless for users.
    </p>

    <h3>Multiple Cryptocurrency Support</h3>
    <p>
      VAULTEX accepts deposits in BTC, ETH, USDT, SOL, and Bank Transfer — 
      giving investors the flexibility to invest using their preferred digital asset.
    </p>

    <h3>Real-Time Dashboard</h3>
    <p>
      Every investor gets a personal dashboard showing their active investments, 
      balance, transaction history, and profit tracking — updated in real time.
    </p>

    <h3>Fast Withdrawals</h3>
    <p>
      Withdrawal requests are processed within 24–48 hours directly to the 
      investor's cryptocurrency wallet or bank account.
    </p>

    <!-- Section 4 -->
    <h1>4. Investment Plans</h1>
    <p>
      VAULTEX offers four structured investment plans designed to match 
      different risk appetites and capital levels.
    </p>

    <table>
      <thead>
        <tr>
          <th>Plan</th>
          <th>Min Investment</th>
          <th>Max Investment</th>
          <th>Return Rate</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Starter</strong></td>
          <td>$100</td>
          <td>$999</td>
          <td>5%</td>
          <td>30 days</td>
        </tr>
        <tr>
          <td><strong>Growth</strong></td>
          <td>$1,000</td>
          <td>$4,999</td>
          <td>12%</td>
          <td>60 days</td>
        </tr>
        <tr>
          <td><strong>Elite</strong></td>
          <td>$5,000</td>
          <td>$19,999</td>
          <td>20%</td>
          <td>90 days</td>
        </tr>
        <tr>
          <td><strong>VIP</strong></td>
          <td>$20,000</td>
          <td>Unlimited</td>
          <td>35%</td>
          <td>180 days</td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box">
      <p>
        <strong>Example:</strong> A $1,000 investment in the Growth Plan at 12% over 60 days 
        returns $1,120 at maturity — a profit of $120 in just two months.
      </p>
    </div>

    <!-- Section 5 -->
    <h1>5. How It Works</h1>

    <h3>Step 1 — Create Account</h3>
    <p>
      Register at vaultex.com with your name, email, and password. 
      Verify your email address to activate your account.
    </p>

    <h3>Step 2 — Choose a Plan</h3>
    <p>
      Browse available investment plans and select one that matches your 
      budget and expected return. Use the built-in profit calculator to 
      see your projected earnings before committing.
    </p>

    <h3>Step 3 — Make a Deposit</h3>
    <p>
      Send cryptocurrency to the provided VAULTEX wallet address using 
      your preferred method (BTC, ETH, USDT, SOL). Upload your payment 
      screenshot as proof of transfer.
    </p>

    <h3>Step 4 — Investment Confirmed</h3>
    <p>
      Our team verifies your payment within a few hours. Once confirmed, 
      your investment is activated and you can track its progress in 
      real time on your dashboard.
    </p>

    <h3>Step 5 — Receive Returns</h3>
    <p>
      When your investment reaches its maturity date, your principal plus 
      profit is credited to your VAULTEX balance. You can then withdraw 
      or reinvest immediately.
    </p>

    <!-- Section 6 -->
    <h1>6. Security & Transparency</h1>
    <p>
      Security is our highest priority. VAULTEX employs multiple layers of 
      protection to ensure every investor's funds and personal data are safe.
    </p>

    <h2>Security Measures</h2>

    <h3>Two-Factor Authentication (2FA)</h3>
    <p>
      All accounts support TOTP-based two-factor authentication via 
      Google Authenticator or Authy — adding an extra layer of security 
      beyond passwords.
    </p>

    <h3>KYC Verification</h3>
    <p>
      Optional Know Your Customer verification allows investors to verify 
      their identity, increasing account trust levels and withdrawal limits.
    </p>

    <h3>Encrypted Communications</h3>
    <p>
      All data is transmitted over HTTPS with TLS encryption. 
      Passwords are hashed using bcrypt with a high salt factor, 
      ensuring they can never be reversed.
    </p>

    <h3>Audit Trail</h3>
    <p>
      Every action on the platform — deposits, withdrawals, investments, 
      admin operations — is logged with timestamps and IP addresses 
      for full accountability.
    </p>

    <!-- Section 7 -->
    <h1>7. Referral Program</h1>
    <p>
      VAULTEX rewards investors who bring new members to the platform 
      through a generous referral commission system.
    </p>

    <table>
      <thead>
        <tr>
          <th>Action</th>
          <th>Commission</th>
          <th>When Paid</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Friend registers using your link</td>
          <td>Tracked</td>
          <td>On registration</td>
        </tr>
        <tr>
          <td>Friend makes first investment</td>
          <td>5% of investment</td>
          <td>On approval</td>
        </tr>
        <tr>
          <td>Commission credited</td>
          <td>Direct to balance</td>
          <td>Immediately</td>
        </tr>
      </tbody>
    </table>

    <div class="highlight-box">
      <p>
        <strong>Example:</strong> You refer a friend who invests $5,000 in the Elite Plan. 
        You earn 5% = <strong>$250 commission</strong> credited directly to your balance.
      </p>
    </div>

    <!-- Section 8 -->
    <h1>8. Team & Company</h1>
    <p>
      VAULTEX was founded by a team of experienced professionals in 
      finance, technology, and blockchain development — united by a 
      common vision of accessible, transparent investment for everyone.
    </p>
    <p>
      Our team brings together expertise from traditional investment 
      banking, software engineering, and cryptocurrency markets to 
      deliver a platform that is both technically robust and 
      financially sound.
    </p>

    <!-- Section 9 -->
    <h1>9. Legal & Compliance</h1>
    <p>
      VAULTEX operates in full compliance with applicable financial 
      regulations. We are committed to maintaining the highest standards 
      of legal and ethical conduct in all our operations.
    </p>
    <p>
      All investors are required to comply with our Terms of Service 
      and Privacy Policy. KYC verification may be required for large 
      withdrawals in accordance with anti-money laundering (AML) regulations.
    </p>

    <!-- Disclaimer -->
    <div class="disclaimer">
      <strong>⚠ Disclaimer:</strong> This white paper is for informational purposes only 
      and does not constitute financial, investment, legal, or tax advice. 
      Cryptocurrency investments carry inherent risks including potential loss of principal. 
      Past performance does not guarantee future results. 
      Invest only what you can afford to lose. 
      VAULTEX is not responsible for any losses incurred through use of the platform.
    </div>

    <p style="text-align:center;margin-top:40px;color:#9898b8;font-size:13px">
      © ${new Date().getFullYear()} VAULTEX Investment Ltd. All rights reserved.<br>
      contact@vaultex.com &nbsp;·&nbsp; vaultex.com
    </p>

  </div>

</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}