'use client';

import type { HelperProfile } from '@/lib/types';
import { useI18n } from '@/i18n/provider';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { helperName } from './helper-text';
import s from './helpers.module.css';

/** dialog รายละเอียดบริจาค — ไม่มี QR เลขบัญชี ปุ่มชำระเงิน ลิงก์บริจาค หรือจำนวนเงิน (PROMPT.md 7.4) */
export function DonationDialog({ open, onClose, helper }: { open: boolean; onClose: () => void; helper: HelperProfile }) {
  const { m, f, locale } = useI18n();
  const name = helperName(helper, locale);
  return (
    <Dialog open={open} onClose={onClose} title={m.helper.donationTitle} size="sm" footer={<Button variant="primary" onClick={onClose}>{m.common.close}</Button>}>
      {helper.donationNote ? <p lang="th">{helper.donationNote}</p> : null}
      <p className={s.donationFixed}><Icon name="info" size="1em" /> {m.helper.donationFixed}</p>
      {helper.isRealOrganization && !helper.isPlaceholder ? (
        <p>
          {f(m.helper.donationOfficial, { name })}{' '}
          {helper.officialUrl ? <a href={helper.officialUrl} target="_blank" rel="noopener noreferrer">{m.helper.officialLink} <Icon name="arrowRight" size="1em" /></a> : <span>({m.helper.noOfficialLink})</span>}
        </p>
      ) : null}
    </Dialog>
  );
}
