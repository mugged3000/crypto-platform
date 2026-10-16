// Content for the five legal pages (/legal/terms, /legal/privacy, ...).
//
// IMPORTANT: this is a well-structured starting draft written around how the
// platform actually works (email verification, KYC, manual deposit/withdrawal
// review, audit logs). It is NOT legal advice. Have a qualified lawyer in your
// jurisdiction review and adjust it before you rely on it in production.
//
// Section shape: { id, heading, content: [ 'paragraph' | { list: [...] } ] }

import { siteConfig } from './siteConfig';

const { name, supportEmail, complianceEmail, privacyEmail, governingLaw } = siteConfig;

export const legalDocs = {
  /* ───────────────────────── TERMS OF SERVICE ───────────────────────── */
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    icon: 'fas fa-file-contract',
    summary: `The agreement between you and ${name} that governs your use of our website, accounts and investment plans.`,
    sections: [
      {
        id: 'acceptance',
        heading: '1. Acceptance of these terms',
        content: [
          `By creating an account, accessing the website or using any ${name} service, you agree to these Terms of Service, our Privacy Policy, our Risk Disclosure and our AML Policy. If you do not agree, do not use the platform.`,
          'We may update these terms from time to time. When we make a material change we will update the date at the top of this page and, where appropriate, notify you by email or in your dashboard. Continuing to use the platform after a change means you accept the updated terms.',
        ],
      },
      {
        id: 'eligibility',
        heading: '2. Eligibility',
        content: [
          'To use the platform you must:',
          { list: [
            'be at least 18 years old (or the age of majority where you live, if higher);',
            'have the legal capacity to enter into a binding agreement;',
            'not be located in, or a resident of, a jurisdiction where our services are prohibited or where using them would be unlawful;',
            'not appear on any sanctions or restricted-persons list; and',
            'provide accurate, complete and current information when you register and whenever it changes.',
          ] },
          'You are responsible for making sure that your use of the platform complies with the laws that apply to you, including tax and reporting obligations.',
        ],
      },
      {
        id: 'accounts',
        heading: '3. Your account',
        content: [
          'You must verify your email address before your account is fully activated. You may only hold one account, and you may not sell, transfer or share it.',
          'You are responsible for keeping your password and any two-factor authentication codes confidential, and for all activity that takes place under your account. Tell us immediately at the support address below if you suspect unauthorised access.',
          `We may restrict, suspend or close an account, or limit specific functions (deposits, withdrawals or new investments), if we believe it is necessary to protect you, other users or ${name}, to comply with the law, or to complete identity or compliance checks.`,
        ],
      },
      {
        id: 'verification',
        heading: '4. Identity verification (KYC)',
        content: [
          'We may require you to complete identity verification before you can deposit, invest or withdraw, or at any later time. This can include a government-issued identity document and a selfie. We may ask for additional information, including about the source of your funds.',
          'We decide, in our reasonable discretion, whether a submission is accepted. Failure to complete verification when requested may result in restrictions on your account or a delay to withdrawals.',
        ],
      },
      {
        id: 'investment-plans',
        heading: '5. Investment plans',
        content: [
          'Each plan displays its key terms, such as the minimum amount, the duration and the stated rate, before you confirm an investment. Those terms apply to the investment as they were published at the time you confirmed it.',
          'An investment becomes active only after we have confirmed your deposit. Amounts, durations and rates for new investments may change at any time and do not affect investments that are already active.',
          'A plan rate is a stated term of the plan, not a promise or guarantee of any outcome. Please read the Risk Disclosure carefully before you invest.',
        ],
      },
      {
        id: 'deposits',
        heading: '6. Deposits',
        content: [
          'Deposits are made in the supported cryptocurrencies by sending funds to the wallet address displayed at the time of your deposit request. You are responsible for choosing the correct asset and network and for copying the address accurately.',
          { list: [
            'Cryptocurrency transfers are irreversible. Funds sent to the wrong address or on the wrong network may be permanently lost, and we may be unable to recover them.',
            'Deposits are credited after we have verified them on the relevant network. We may delay or reject a deposit that we cannot match to your request or that fails a compliance check.',
            'You must only deposit funds that you legitimately own and that come from lawful sources.',
          ] },
        ],
      },
      {
        id: 'withdrawals',
        heading: '7. Withdrawals',
        content: [
          'You may request a withdrawal of available funds to a wallet address you control, subject to the maturity terms of your plan and any minimum amounts shown on the withdrawal page.',
          { list: [
            'Withdrawals are reviewed before they are released. We may ask for additional verification, and we may decline or delay a withdrawal where required by law, where we suspect fraud or a breach of these terms, or where your account is under review.',
            'Network fees, where they apply, are displayed before you confirm.',
            'Withdrawals are sent only to the address you provide. Once a transfer is broadcast it cannot be reversed, so please check the address and network carefully.',
          ] },
        ],
      },
      {
        id: 'referrals',
        heading: '8. Referral programme',
        content: [
          'Where we offer a referral programme, its rewards and conditions are described in your dashboard. Self-referrals, duplicate or fake accounts and any attempt to manipulate the programme are prohibited, and we may withhold or reverse rewards and close accounts that abuse it.',
        ],
      },
      {
        id: 'prohibited',
        heading: '9. Prohibited conduct',
        content: [
          'You agree not to:',
          { list: [
            'use the platform for money laundering, terrorist financing, fraud, or any other unlawful purpose;',
            'provide false or misleading information, or impersonate another person;',
            'attempt to gain unauthorised access to the platform, other users’ accounts or our systems;',
            'interfere with the operation of the platform, including by using bots, scrapers or automated tools without our permission;',
            'circumvent any limit, restriction or verification we apply to your account.',
          ] },
        ],
      },
      {
        id: 'fees',
        heading: '10. Fees and taxes',
        content: [
          'Any fees that apply to an action are displayed before you confirm it. You are solely responsible for determining and paying any taxes that arise from your use of the platform, and we do not provide tax advice.',
        ],
      },
      {
        id: 'no-advice',
        heading: '11. No financial advice',
        content: [
          `Information on the website and in your dashboard is provided for general information only. Nothing on the platform is investment, legal, tax or financial advice, and ${name} does not make personal recommendations. You should seek independent professional advice if you are unsure whether a plan is suitable for you.`,
        ],
      },
      {
        id: 'liability',
        heading: '12. Limitation of liability',
        content: [
          `To the fullest extent permitted by law, ${name} is not liable for indirect, incidental or consequential losses, for loss of profit or opportunity, for losses caused by market movements, network congestion, blockchain failures or events outside our reasonable control, or for losses arising from your own errors (such as sending funds to an incorrect address) or from unauthorised access that results from your failure to keep your credentials secure.`,
          'Nothing in these terms excludes or limits liability that cannot lawfully be excluded or limited.',
        ],
      },
      {
        id: 'termination',
        heading: '13. Closing your account',
        content: [
          'You may stop using the platform and ask us to close your account at any time by contacting support, once any active investments have reached maturity or been settled under their plan terms. We may close or suspend your account in the circumstances described in these terms. Provisions that by their nature should survive closure will continue to apply.',
        ],
      },
      {
        id: 'law',
        heading: '14. Governing law and disputes',
        content: [
          `These terms are governed by the laws of ${governingLaw}. We encourage you to contact us first so that we can try to resolve any complaint informally. If we cannot, the courts of that jurisdiction will have jurisdiction, unless mandatory consumer law in your country gives you the right to bring a claim elsewhere.`,
        ],
      },
      {
        id: 'contact',
        heading: '15. Contact',
        content: [
          `Questions about these terms can be sent to ${supportEmail} or through our Contact page.`,
        ],
      },
    ],
  },

  /* ───────────────────────── PRIVACY POLICY ───────────────────────── */
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    icon: 'fas fa-user-shield',
    summary: `What personal data ${name} collects, why we collect it, who we share it with and the choices you have.`,
    sections: [
      {
        id: 'overview',
        heading: '1. Overview',
        content: [
          `This policy explains how ${name} collects and uses personal data when you visit our website or use your account. We only collect what we need to run the platform, keep it secure and meet our legal obligations.`,
        ],
      },
      {
        id: 'data-we-collect',
        heading: '2. Information we collect',
        content: [
          { list: [
            'Account details: your name, email address, phone number (if provided), country and a hashed version of your password. We never store your password in readable form.',
            'Identity verification data: the type of identity document you submit, images of the document and a selfie, and the outcome of our review.',
            'Financial activity: deposits, withdrawals, investments, balances, transaction history and the wallet addresses you provide.',
            'Security and device data: IP address, browser and device information, approximate country and login history, which we use to detect suspicious activity.',
            'Communications: messages you send through support tickets or the contact form, and notifications we send you.',
            'Profile content: an avatar image, if you choose to upload one.',
            'Referral data: your referral code and who referred you, if applicable.',
          ] },
        ],
      },
      {
        id: 'how-we-use',
        heading: '3. How we use your information',
        content: [
          { list: [
            'to create and maintain your account and to process deposits, investments and withdrawals;',
            'to verify your identity and carry out anti-money-laundering and fraud checks;',
            'to secure the platform, detect unusual activity and investigate abuse;',
            'to send you service emails such as verification links, password resets and account notices;',
            'to respond to support requests and enquiries;',
            'to meet our legal, tax and regulatory obligations; and',
            'to improve how the platform works.',
          ] },
          'Where the law requires a legal basis for processing, we rely on performing our contract with you, complying with legal obligations, our legitimate interests in keeping the platform secure and preventing fraud, and, where needed, your consent.',
        ],
      },
      {
        id: 'sharing',
        heading: '4. Who we share data with',
        content: [
          'We do not sell your personal data. We share it only where necessary:',
          { list: [
            'with service providers that help us operate the platform, such as hosting, email delivery and identity-verification support, under obligations to protect your data;',
            'with professional advisers, auditors and insurers where reasonably required;',
            'with law-enforcement, regulators or courts when we are legally required to, or when needed to protect rights, safety or prevent fraud; and',
            'in connection with a merger, acquisition or sale of assets, in which case we will ensure the receiving party honours this policy.',
          ] },
        ],
      },
      {
        id: 'blockchain',
        heading: '5. Blockchain transactions',
        content: [
          'Cryptocurrency transactions are recorded on public blockchains. Wallet addresses and transfer details on those networks are public and cannot be altered or deleted by us, so they fall outside the scope of any deletion request.',
        ],
      },
      {
        id: 'retention',
        heading: '6. How long we keep data',
        content: [
          'We keep personal data for as long as your account is open and for as long afterwards as is needed to meet legal, tax, accounting and anti-money-laundering record-keeping obligations, to resolve disputes and to enforce our agreements. When data is no longer needed we delete or anonymise it.',
        ],
      },
      {
        id: 'security',
        heading: '7. Security',
        content: [
          'We use technical and organisational measures to protect your data, including hashed passwords, access controls, logging of administrator actions and encrypted connections. No system is completely secure, so please use a strong, unique password, enable two-factor authentication where available and keep your devices up to date.',
        ],
      },
      {
        id: 'your-rights',
        heading: '8. Your rights',
        content: [
          'Depending on where you live, you may have the right to:',
          { list: [
            'access the personal data we hold about you;',
            'correct inaccurate or incomplete data;',
            'request deletion of your data, subject to our legal retention duties;',
            'object to or ask us to restrict certain processing;',
            'receive a copy of your data in a portable format; and',
            'withdraw consent where we rely on it.',
          ] },
          `To exercise any of these rights, contact ${privacyEmail}. We may need to verify your identity before acting on a request. You can also lodge a complaint with your local data-protection authority.`,
        ],
      },
      {
        id: 'cookies',
        heading: '9. Cookies and local storage',
        content: [
          'We use essential cookies and your browser’s local storage to keep you signed in and to remember basic session information. We do not use them to sell advertising. You can clear this data at any time in your browser, but you will be signed out and some features may stop working.',
        ],
      },
      {
        id: 'transfers',
        heading: '10. International transfers',
        content: [
          'Our service providers may process data in countries other than your own. Where we transfer personal data internationally, we take steps to make sure it remains protected to a standard consistent with this policy.',
        ],
      },
      {
        id: 'children',
        heading: '11. Children',
        content: [
          'The platform is not intended for anyone under 18, and we do not knowingly collect data from children. If you believe a child has given us personal data, please contact us and we will delete it.',
        ],
      },
      {
        id: 'changes',
        heading: '12. Changes and contact',
        content: [
          `We may update this policy and will change the date at the top of the page when we do. Questions or requests can be sent to ${privacyEmail}.`,
        ],
      },
    ],
  },

  /* ───────────────────────── RISK DISCLOSURE ───────────────────────── */
  'risk-disclosure': {
    slug: 'risk-disclosure',
    title: 'Risk Disclosure',
    icon: 'fas fa-triangle-exclamation',
    summary: 'Digital-asset investing carries significant risk. Please read this carefully before you invest anything.',
    sections: [
      {
        id: 'important',
        heading: 'Important notice',
        content: [
          'Investing in digital assets and related plans involves a high degree of risk, and you could lose some or all of the money you put in. Only invest money you can afford to lose. This page does not describe every risk, and it is not investment advice.',
        ],
      },
      {
        id: 'no-guarantee',
        heading: '1. Returns are not guaranteed',
        content: [
          'Any rate, target or projected figure shown on the website or in your dashboard describes the terms of a plan; it is not a guarantee of profit and does not predict what you will receive. Past performance is not a reliable indicator of future results. Your capital is at risk.',
        ],
      },
      {
        id: 'volatility',
        heading: '2. Market volatility',
        content: [
          'The value of cryptocurrencies can rise and fall sharply within minutes and can fall to zero. Prices are affected by speculation, regulation, news, liquidity, technological problems and the actions of large holders. These movements can affect the value of the assets that sit behind a plan and the value of anything you hold or receive in crypto.',
        ],
      },
      {
        id: 'not-protected',
        heading: '3. No deposit protection',
        content: [
          `Balances held with ${name} are not bank deposits. They are not covered by any government deposit-guarantee or investor-compensation scheme, and you should not assume they are insured.`,
        ],
      },
      {
        id: 'counterparty',
        heading: '4. Operational and counterparty risk',
        content: [
          'Like any platform, we depend on technology, third-party providers and people. Cyber-attacks, software defects, loss of private keys, provider failures, fraud and human error can all lead to delays or losses, even where we apply strong controls.',
        ],
      },
      {
        id: 'irreversible',
        heading: '5. Irreversible transfers',
        content: [
          'Blockchain transactions cannot be reversed. If you send funds to the wrong address, on the wrong network or in the wrong asset, they may be lost permanently. You are responsible for checking every address and network before you confirm a transfer.',
        ],
      },
      {
        id: 'liquidity',
        heading: '6. Lock-up and liquidity',
        content: [
          'Plans have a duration. You may be unable to access invested funds before the end of that period, and withdrawals are reviewed before release. Delays can also occur because of network congestion, compliance checks or maintenance.',
        ],
      },
      {
        id: 'regulatory',
        heading: '7. Legal and regulatory risk',
        content: [
          'Laws about digital assets differ by country and change often. New rules could restrict or prohibit certain activities, affect the availability of the platform in your location, or change how your holdings are treated for legal and tax purposes. It is your responsibility to understand the rules that apply to you.',
        ],
      },
      {
        id: 'scams',
        heading: '8. Scams and impersonation',
        content: [
          `Be cautious of anyone who contacts you claiming to represent ${name}. We will never ask you for your password, two-factor codes or private keys, and we will not ask you to send funds to a personal wallet. Always check that you are on the correct website, and report suspicious messages to ${supportEmail}.`,
        ],
      },
      {
        id: 'your-decision',
        heading: '9. Your decision',
        content: [
          'Before investing, consider your financial situation, experience and risk tolerance, and speak to an independent adviser if you are unsure. By using the platform, you confirm that you understand these risks and that you are making your own decisions.',
        ],
      },
    ],
  },

  /* ───────────────────────── AML POLICY ───────────────────────── */
  'aml-policy': {
    slug: 'aml-policy',
    title: 'AML Policy',
    icon: 'fas fa-magnifying-glass-dollar',
    summary: `How ${name} works to prevent money laundering, terrorist financing and other financial crime on the platform.`,
    sections: [
      {
        id: 'commitment',
        heading: '1. Our commitment',
        content: [
          `${name} is committed to preventing its platform from being used for money laundering, terrorist financing, fraud or sanctions evasion. This policy sets out the controls we apply and what we expect from our users.`,
        ],
      },
      {
        id: 'cdd',
        heading: '2. Customer due diligence',
        content: [
          'We identify and verify our users before they can fully use the platform. Depending on the risk, we may collect:',
          { list: [
            'your full name, country and contact details;',
            'a valid government-issued identity document (front and, where relevant, back);',
            'a selfie so that we can match you to your document; and',
            'additional information, such as proof of address or an explanation of your source of funds.',
          ] },
          'We may re-verify users at any time, for example when their activity changes or when documents expire.',
        ],
      },
      {
        id: 'risk-based',
        heading: '3. Risk-based approach',
        content: [
          'We assess risk using factors such as the user’s country, the size and pattern of their transactions, and the information they have provided. Higher-risk accounts receive enhanced checks, which may include further documents, closer review and additional approvals.',
        ],
      },
      {
        id: 'monitoring',
        heading: '4. Transaction monitoring',
        content: [
          'Deposits and withdrawals are reviewed by our team before they are released. We look for unusual patterns, such as activity inconsistent with a user’s profile, rapid movement of funds with no apparent purpose, structuring of payments to avoid limits, or use of addresses linked to illicit activity. Administrator actions on the platform are recorded in an audit log.',
        ],
      },
      {
        id: 'sanctions',
        heading: '5. Sanctions',
        content: [
          'We do not provide services to individuals or entities subject to applicable sanctions, or to people in jurisdictions where doing so is prohibited. We may decline, freeze or reject activity where we believe a sanctions risk exists.',
        ],
      },
      {
        id: 'suspicious',
        heading: '6. Suspicious activity',
        content: [
          'Where we suspect that activity may involve criminal proceeds or financial crime, we may delay or refuse a transaction, restrict an account and report the matter to the relevant authorities as required by law. In some cases we are legally prohibited from telling a user that a report has been made.',
        ],
      },
      {
        id: 'prohibited',
        heading: '7. What is not allowed',
        content: [
          { list: [
            'depositing funds that come from criminal activity;',
            'using multiple or false identities, or letting someone else operate your account;',
            'using the platform to move funds on behalf of third parties;',
            'attempting to hide the origin or destination of funds.',
          ] },
          'We may close accounts and withhold funds where the law requires it if we find a breach.',
        ],
      },
      {
        id: 'records',
        heading: '8. Record keeping',
        content: [
          'We keep identity, verification and transaction records for the period required by applicable law, and in any case as long as needed to meet our regulatory and investigative obligations.',
        ],
      },
      {
        id: 'training',
        heading: '9. Governance and training',
        content: [
          'Responsibility for AML compliance sits with senior management and a designated compliance contact. Team members who handle verification, deposits and withdrawals are trained to recognise red flags and to escalate concerns. We review this policy regularly and update it when laws or our risks change.',
        ],
      },
      {
        id: 'report',
        heading: '10. Contact',
        content: [
          `To report a concern or ask about this policy, contact ${complianceEmail}.`,
        ],
      },
    ],
  },

  /* ───────────────────────── COMPLIANCE ───────────────────────── */
  compliance: {
    slug: 'compliance',
    title: 'Compliance',
    icon: 'fas fa-scale-balanced',
    summary: `An overview of how ${name} approaches legal, regulatory and ethical standards across the platform.`,
    sections: [
      {
        id: 'approach',
        heading: '1. Our approach',
        content: [
          `${name} aims to operate lawfully, transparently and with appropriate controls. Compliance is part of how we build and run the platform, from the way accounts are opened to how funds are moved and how problems are handled.`,
        ],
      },
      {
        id: 'framework',
        heading: '2. Compliance framework',
        content: [
          { list: [
            'Identity verification and customer due diligence for users (see our AML Policy).',
            'Review of deposits and withdrawals before release, with escalation of anything unusual.',
            'Account-level controls that let us restrict deposits, withdrawals or investing where needed.',
            'An audit trail of administrator actions, so that decisions can be reviewed afterwards.',
            'Regular review of our policies as laws and risks change.',
          ] },
        ],
      },
      {
        id: 'regulatory',
        heading: '3. Regulatory status',
        content: [
          `${name} is not a bank. Digital-asset rules differ between countries and are evolving, and some services may not be available everywhere. Questions about our corporate registration or the regulatory position that applies to a particular service can be sent to ${complianceEmail}.`,
        ],
      },
      {
        id: 'sanctions',
        heading: '4. Sanctions and restricted jurisdictions',
        content: [
          'We do not knowingly serve sanctioned persons or users in jurisdictions where our services are prohibited. We may restrict access based on location, and we may ask users to confirm their country of residence.',
        ],
      },
      {
        id: 'data-protection',
        heading: '5. Data protection',
        content: [
          `We handle personal data in line with our Privacy Policy, collect only what we need and apply security controls to protect it. Privacy requests can be sent to ${privacyEmail}.`,
        ],
      },
      {
        id: 'marketing',
        heading: '6. Fair and honest communication',
        content: [
          'We aim to describe our plans accurately and to explain the risks clearly. Please read the Risk Disclosure alongside any plan information. Nobody at VAULTEX is permitted to guarantee returns or pressure you to invest.',
        ],
      },
      {
        id: 'complaints',
        heading: '7. Complaints',
        content: [
          `If you are unhappy with our service, tell us through a support ticket in your dashboard or at ${supportEmail}. We will acknowledge your complaint, investigate it fairly and respond with the outcome. If you are not satisfied, you may be able to escalate to a regulator or ombudsman in your country.`,
        ],
      },
      {
        id: 'whistleblowing',
        heading: '8. Reporting concerns',
        content: [
          `If you are aware of misconduct, suspected financial crime or a security issue involving the platform, please report it to ${complianceEmail}. We take every report seriously and do not tolerate retaliation against people who raise concerns in good faith.`,
        ],
      },
    ],
  },
};

export const legalOrder = ['terms', 'privacy', 'risk-disclosure', 'aml-policy', 'compliance'];