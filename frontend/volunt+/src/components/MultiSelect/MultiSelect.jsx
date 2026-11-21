import * as React from "react";

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";

import "./MultiSelect.css";

const SELECT_ALL_VALUE = "__all__";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  disableScrollLock: true,
  marginThreshold: null,
  slotProps: {
    paper: {
      className: "multiple-select__paper",
      style: {
        maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
      },
    },
  },
};

export default function MultiSelect({
  id,
  name,
  label = "Selecione",
  options = [],
  value = [],
  onChange,
  placeholder = "",
  defaultOption,
  helperText = "",
  width = "400px",
  height = "50px",
  error = false,
  disabled = false,
}) {
  const generatedId = React.useId();

  const selectId = id || `multiple-select-${generatedId}`;

  const labelId = `${selectId}-label`;

  const selectedValues = Array.isArray(value) ? value : [];
  const emptyLabel = defaultOption ?? placeholder;

  const optionValues = React.useMemo(
    () => options.map((option) => option.value),
    [options],
  );

  const allSelected =
    optionValues.length > 0 &&
    optionValues.every((optionValue) => selectedValues.includes(optionValue));

  const hasSomeSelected = selectedValues.length > 0 && !allSelected;

  function updateSelectedValues(nextValue) {
    if (onChange) {
      onChange({
        target: {
          name,
          value: nextValue,
        },
      });

      return;
    }
  }

  function handleChange(event) {
    const nextValue = event.target.value;

    const normalizedValue =
      typeof nextValue === "string" ? nextValue.split(",") : nextValue;

    if (normalizedValue.includes(SELECT_ALL_VALUE)) {
      if (allSelected) {
        updateSelectedValues([]);
      } else {
        updateSelectedValues(optionValues);
      }

      return;
    }

    updateSelectedValues(normalizedValue);
  }

  function renderSelectedValue(selected) {
    if (selected.length === 0) {
      return <span className="multiple-select__placeholder">{emptyLabel}</span>;
    }

    if (allSelected) {
      return "Todas";
    }

    if (selected.length > 2) {
      return `${selected.length} selecionadas`;
    }

    return selected
      .map((selectedValue) => {
        const option = options.find((option) => option.value === selectedValue);

        return option?.label ?? selectedValue;
      })
      .join(", ");
  }

  return (
    <FormControl
      className="multiple-select"
      size="small"
      style={{
        width,
        height,
      }}
      error={error}
      disabled={disabled}
    >
      {/* LABEL */}
      <InputLabel id={labelId} className="multiple-select__label">
        {label}
      </InputLabel>

      {/* SELECT */}
      <Select
        labelId={labelId}
        id={selectId}
        name={name}
        multiple
        value={selectedValues}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={renderSelectedValue}
        displayEmpty
        MenuProps={MenuProps}
        className="multiple-select__field"
      >
        {/* TODAS */}
        <MenuItem value={SELECT_ALL_VALUE} className="multiple-select__item">
          <Checkbox
            checked={allSelected}
            indeterminate={hasSomeSelected}
            className="multiple-select__checkbox"
          />

          <ListItemText primary="Todas" />
        </MenuItem>

        {/* OPÇÕES */}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            className="multiple-select__item"
          >
            <Checkbox
              checked={selectedValues.includes(option.value)}
              className="multiple-select__checkbox"
            />

            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>

      {/* MENSAGEM DE ERRO/AJUDA */}
      {helperText && (
        <FormHelperText className="multiple-select__helper-text">
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
