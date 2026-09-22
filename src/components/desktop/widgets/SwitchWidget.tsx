import React from 'react';
import { Wifi, Globe } from 'lucide-react';

interface NeumorphicToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

export const NeumorphicToggle: React.FC<NeumorphicToggleProps> = ({ checked, onChange }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: '46px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: 'var(--nm-bg)',
        boxShadow: 'var(--nm-inset-sm)',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'var(--nm-bg)',
          boxShadow: '2px 2px 4px rgba(166, 180, 200, 0.6), -2px -2px 4px rgba(255, 255, 255, 0.95)',
          transform: checked ? 'translateX(22px)' : 'translateX(0)',
          transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: checked ? '#5096C6' : '#92A2B3',
          }}
        />
      </div>
    </div>
  );
};

interface NetworkControlsProps {
  wifiEnabled?: boolean;
  dataEnabled?: boolean;
  onWifiChange?: (v: boolean) => void;
  onDataChange?: (v: boolean) => void;
}

export const NetworkControls: React.FC<NetworkControlsProps> = ({
  wifiEnabled = false,
  dataEnabled = true,
  onWifiChange,
  onDataChange,
}) => {
  const [wifi, setWifi] = React.useState(wifiEnabled);
  const [data, setData] = React.useState(dataEnabled);

  const handleWifi = (v: boolean) => {
    setWifi(v);
    onWifiChange?.(v);
  };

  const handleData = (v: boolean) => {
    setData(v);
    onDataChange?.(v);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', height: '100%' }}>
      {/* WI-FI 卡片 */}
      <div
        className="nm-card-sm"
        style={{
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          borderRadius: '16px',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#475971', letterSpacing: '0.2px' }}>
          WI-FI
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8E9EAF' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>
              {wifi ? 'on' : 'off'}
            </span>
            <Wifi size={13} strokeWidth={2.2} />
          </div>
          <NeumorphicToggle checked={wifi} onChange={handleWifi} />
        </div>
      </div>

      {/* Data Selular (移动数据) 卡片 */}
      <div
        className="nm-card-sm"
        style={{
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          borderRadius: '16px',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#475971', letterSpacing: '0.2px' }}>
          Data Selular
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8E9EAF' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>
              {data ? 'on' : 'off'}
            </span>
            <Globe size={13} strokeWidth={2.2} />
          </div>
          <NeumorphicToggle checked={data} onChange={handleData} />
        </div>
      </div>
    </div>
  );
};
