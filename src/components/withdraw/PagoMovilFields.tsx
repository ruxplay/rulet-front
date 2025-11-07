import React from 'react';

interface PagoMovilFieldsProps {
  formData: {
    banco: string;
    phoneNumber: string;
    accountHolder: string;
  };
  errors: {
    banco?: string;
    phoneNumber?: string;
    accountHolder?: string;
  };
  shouldShowError: (fieldName: string) => boolean;
  onChange: (field: string, value: string) => void;
}

const BANCO_CODES = [
  { value: '0102', label: 'Banco de Venezuela' },
  { value: '0104', label: 'Banco Venezolano de Crédito (BVC)' },
  { value: '0105', label: 'Banco Mercantil' },
  { value: '0108', label: 'Banco Provincial' },
  { value: '0134', label: 'Banesco' },
  { value: '0137', label: 'Banco del Tesoro' },
  { value: '0138', label: 'Banco del Sur' },
  { value: '0151', label: 'Banco del Pueblo Soberano' },
  { value: '0156', label: '100% Banco' },
  { value: '0157', label: 'Banco Nacional de Crédito (BNC)' },
  { value: '0163', label: 'Banco Bancaribe' },
  { value: '0166', label: 'Banco del Caribe' },
  { value: '0168', label: 'Banco Plaza' },
  { value: '0169', label: 'Banco de Comercio Exterior (BANCOEX)' },
  { value: '0171', label: 'Banco Activo' },
  { value: '0174', label: 'Banplus' },
];

export const PagoMovilFields: React.FC<PagoMovilFieldsProps> = ({
  formData,
  errors,
  shouldShowError,
  onChange,
}) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="bancoPagoMovil" className="form-label">
          Código del Banco *
        </label>
        <select
          id="bancoPagoMovil"
          name="banco"
          value={formData.banco}
          onChange={(e) => onChange('banco', e.target.value)}
          className={`form-select ${shouldShowError('banco') ? 'error' : ''}`}
        >
          <option value="">Seleccione el banco</option>
          {BANCO_CODES.map((banco) => (
            <option key={banco.value} value={banco.value}>
              {banco.value} - {banco.label}
            </option>
          ))}
        </select>
        {shouldShowError('banco') && <span className="error-message">{errors.banco}</span>}
        <div className="field-help">
          Seleccione el código de 4 dígitos del banco (ej: 0105 = Mercantil, 0134 = Banesco)
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber" className="form-label">
          Teléfono del Beneficiario *
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => {
            // Solo permitir números
            const numericValue = e.target.value.replace(/[^0-9]/g, '');
            onChange('phoneNumber', numericValue);
          }}
          className={`form-input ${shouldShowError('phoneNumber') ? 'error' : ''}`}
          placeholder="Ej: 04144446186"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {shouldShowError('phoneNumber') && <span className="error-message">{errors.phoneNumber}</span>}
        <div className="field-help">
          Número de teléfono asociado al Pago Móvil donde recibirás el dinero (ej: 04144446186)
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="accountHolder" className="form-label">
          Cédula o RIF del Titular *
        </label>
        <input
          type="text"
          id="accountHolder"
          name="accountHolder"
          value={formData.accountHolder}
          onChange={(e) => onChange('accountHolder', e.target.value)}
          className={`form-input ${shouldShowError('accountHolder') ? 'error' : ''}`}
          placeholder="Ej: 24967880"
        />
        {shouldShowError('accountHolder') && <span className="error-message">{errors.accountHolder}</span>}
        <div className="field-help">
          Cédula o RIF del titular de la cuenta Pago Móvil (ej: 24967880 o V-24967880)
        </div>
      </div>
    </>
  );
};
