import * as React from "react";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";

export default function DataPicker({
  width = "400px",
  height = "50px",
  label,
  value = "",
  onChange,
  onBlur,
  error = false,
  helperText = "",
  disabled = false,
}) {
  const [cleared, setCleared] = React.useState(false);

  React.useEffect(() => {
    if (!cleared) return;

    const timeout = setTimeout(() => {
      setCleared(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [cleared]);

  const pickerValue = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box
        sx={{
          width: "100%",
          maxWidth: width,
          height: helperText ? "72px" : height,
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <DatePicker
          label={label}
          disabled={disabled}
          value={pickerValue}
          onChange={(newValue) => {
            if (!newValue || !newValue.isValid()) {
              onChange?.("");
              return;
            }

            const formattedDate = newValue.format("YYYY-MM-DD");

            onChange?.(formattedDate);
          }}
          format="DD/MM/YYYY"
          slotProps={{
            field: {
              clearable: !disabled,
              onBlur,

              onClear: () => {
                onChange?.("");
                setCleared(true);
              },
            },
          }}
          sx={{
            width: "100%",
            maxWidth: width,
            "& .MuiInputLabel-root": {
              fontWeight: 400,
            },
            "& .MuiPickersOutlinedInput-root": {
              height: "50px",
              borderColor: error ? "#dc2626" : undefined,
            },
            "& .MuiFormHelperText-root": {
              color: "#dc2626",
              marginLeft: 0,
            },
          }}
        />

        {helperText && (
          <span
            style={{
              position: "absolute",
              top: "52px",
              left: 0,
              color: "#dc2626",
              fontSize: "12px",
            }}
          >
            {helperText}
          </span>
        )}

        {cleared && (
          <Alert
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
            }}
            severity="success"
          >
            Campo limpo!
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
}
