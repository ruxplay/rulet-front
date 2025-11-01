import React from 'react';

interface UsdtFieldsProps {
  formData: {
    network: string;
    walletAddress: string;
  };
  errors: {
    network?: string;
    walletAddress?: string;
  };
  onChange: (field: string, value: string) => void;
}

const NETWORKS = [
  { value: 'TRC20', label: 'TRC20 (Tron) - Más rápido y económico' },
  { value: 'BEP20', label: 'BEP20 (Binance Smart Chain) - Rápido y económico' },
  { value: 'ERC20', label: 'ERC20 (Ethereum) - Más lento y costoso' },
];

export const UsdtFields: React.FC<UsdtFieldsProps> = ({ formData, errors, onChange }) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="network" className="form-label">
          Red Blockchain *
        </label>
        <select
          id="network"
          name="network"
          value={formData.network}
          onChange={(e) => onChange('network', e.target.value)}
          className={`form-select ${errors.network ? 'error' : ''}`}
        >
          <option value="">Seleccione una red</option>
          {NETWORKS.map((network) => (
            <option key={network.value} value={network.value}>
              {network.label}
            </option>
          ))}
        </select>
        {errors.network && <span className="error-message">{errors.network}</span>}
        <div className="field-help">
          Selecciona la red que soporte tu wallet. TRC20 es la más recomendada.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="walletAddress" className="form-label">
          Dirección de Wallet *
        </label>
        <input
          type="text"
          id="walletAddress"
          name="walletAddress"
          value={formData.walletAddress}
          onChange={(e) => onChange('walletAddress', e.target.value)}
          className={`form-input ${errors.walletAddress ? 'error' : ''}`}
          placeholder="Ej: TXYZ1234567890abcdefghijklmnopqrstuvwx"
        />
        {errors.walletAddress && <span className="error-message">{errors.walletAddress}</span>}
        <div className="field-help">
          Dirección de tu wallet donde recibirás los USDT. la dirección que introduzcas.
        </div>
      </div>
    </>
  );
};

