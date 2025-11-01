import React from 'react';

interface BankTransferFieldsProps {
  formData: {
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
  errors: {
    accountType?: string;
    accountNumber?: string;
    accountHolder?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const BankTransferFields: React.FC<BankTransferFieldsProps> = ({
  formData,
  errors,
  onChange,
}) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="accountType" className="form-label">
          Tipo de Cuenta *
        </label>
        <select
          id="accountType"
          name="accountType"
          value={formData.accountType}
          onChange={(e) => onChange('accountType', e.target.value)}
          className={`form-select ${errors.accountType ? 'error' : ''}`}
        >
          <option value="">Seleccione un tipo</option>
          <option value="ahorros">Cuenta de Ahorros</option>
          <option value="corriente">Cuenta Corriente</option>
        </select>
        {errors.accountType && <span className="error-message">{errors.accountType}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="accountNumber" className="form-label">
          Número de Cuenta *
        </label>
        <input
          type="text"
          id="accountNumber"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={(e) => onChange('accountNumber', e.target.value)}
          className={`form-input ${errors.accountNumber ? 'error' : ''}`}
          placeholder="Ej: 1234567890"
        />
        {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="accountHolder" className="form-label">
          Nombre del Titular *
        </label>
        <input
          type="text"
          id="accountHolder"
          name="accountHolder"
          value={formData.accountHolder}
          onChange={(e) => onChange('accountHolder', e.target.value)}
          className={`form-input ${errors.accountHolder ? 'error' : ''}`}
          placeholder="Ej: Juan Pérez"
        />
        {errors.accountHolder && <span className="error-message">{errors.accountHolder}</span>}
      </div>
    </>
  );
};



