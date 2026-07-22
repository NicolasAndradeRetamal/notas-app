'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/select';

const OPTIONS = [
  { value: 'updated', label: 'Última edición' },
  { value: 'created', label: 'Fecha de creación' },
  { value: 'title', label: 'Título (A–Z)' },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get('sort') ?? 'updated';

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'updated') {
      params.delete('sort');
    } else {
      params.set('sort', next);
    }
    params.delete('page');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Select
      label="Orden"
      hideLabel
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="w-auto"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          Orden: {option.label}
        </option>
      ))}
    </Select>
  );
}
