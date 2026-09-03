import {
  useEffect,
  useRef,
  useState,
} from "react";

function FloatingNotification({
  title = "Notificación",
  message,
  type = "info",
  duration = 5000,
  onClose,
  onTimeout,
  actions = [],
}) {
  const [visible, setVisible] = useState(false);

  const onCloseRef = useRef(onClose);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }

    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);

      const cerrar = window.setTimeout(() => {
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        } else {
          onCloseRef.current?.();
        }
      }, 220);

      return () => {
        window.clearTimeout(cerrar);
      };
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, duration]);

  if (!message) {
    return null;
  }

  const estilosTipo = {
    info: {
      background: "rgba(23, 39, 70, 0.75)",
      accent: "#d8e4ff",
    },
    success: {
      background: "rgba(26, 104, 68, 0.75)",
      accent: "#d8f5e5",
    },
    warning: {
      background: "rgba(151, 97, 0, 0.75)",
      accent: "#fff0c2",
    },
    error: {
      background: "rgba(150, 48, 48, 0.75)",
      accent: "#ffe1e1",
    },
  };

  const estilo =
    estilosTipo[type] || estilosTipo.info;

  const cerrarManual = () => {
    setVisible(false);

    window.setTimeout(() => {
      onCloseRef.current?.();
    }, 220);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "22px",
        right: "22px",
        width: "min(420px, calc(100vw - 32px))",
        zIndex: 99999,
        padding: "16px 18px",
        boxSizing: "border-box",
        borderRadius: "14px",
        border: `1px solid ${estilo.accent}`,
        background: estilo.background,
        color: "#ffffff",
        boxShadow:
          "0 14px 34px rgba(15, 23, 42, 0.24)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : "translateY(-12px)",
        transition:
          "opacity 220ms ease, transform 220ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: "5px",
              fontSize: "15px",
            }}
          >
            {title}
          </strong>

          <div
            style={{
              fontSize: "14px",
              lineHeight: 1.45,
              overflowWrap: "break-word",
            }}
          >
            {message}
          </div>
        </div>

        <button
          type="button"
          onClick={cerrarManual}
          aria-label="Cerrar notificación"
          style={{
            flex: "0 0 auto",
            width: "30px",
            height: "30px",
            padding: 0,
            border: "1px solid rgba(255,255,255,0.42)",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.12)",
            color: "#ffffff",
            fontSize: "20px",
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {actions.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginTop: "12px",
          }}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: action.secondary
                  ? "1px solid rgba(255,255,255,0.5)"
                  : "1px solid #ffffff",
                background: action.secondary
                  ? "rgba(255,255,255,0.10)"
                  : "rgba(255,255,255,0.92)",
                color: action.secondary
                  ? "#ffffff"
                  : "#172746",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: "3px",
          width: visible ? "0%" : "100%",
          background: "rgba(255,255,255,0.72)",
          borderRadius: "0 0 0 14px",
          transition: visible
            ? `width ${duration}ms linear`
            : "none",
        }}
      />
    </div>
  );
}

export default FloatingNotification;
