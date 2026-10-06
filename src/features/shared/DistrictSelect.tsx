'use client';

import { useMemo, type SelectHTMLAttributes } from 'react';
import { DISTRICTS } from '@/data/districts';
import { useI18n } from '@/i18n/provider';
import { Select } from '@/components/ui/Field';

export function DistrictSelect({ placeholder, ...rest }: { placeholder?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const { locale } = useI18n();
  const sorted = useMemo(
    () => [...DISTRICTS].sort((a, b) => (locale === 'en' ? a.nameEn.localeCompare(b.nameEn) : a.nameTh.localeCompare(b.nameTh, 'th'))),
    [locale],
  );
  return (
    <Select {...rest}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {sorted.map((d) => (
        <option key={d.id} value={d.id}>{locale === 'en' ? d.nameEn : d.nameTh}</option>
      ))}
    </Select>
  );
}
