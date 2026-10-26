import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HealthBadge } from './health-badge';

describe('HealthBadge', () => {
  it('mostra o nome do serviço e "No ar" quando está de pé', () => {
    render(<HealthBadge label="API" status="up" />);

    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('No ar')).toBeInTheDocument();
  });

  it('mostra "Fora do ar" quando está fora', () => {
    render(<HealthBadge label="Banco de dados" status="down" />);

    expect(screen.getByText('Fora do ar')).toBeInTheDocument();
  });
});
