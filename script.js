'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const digits = new Array(3).fill(undefined);

  let multiplier,
    tolerance,
    tcr,
    toleranceMode = 'Legacy',
    modeBackup,
    resetting = false,
    minInput = 0.01,
    sameUnit = false,
    resistanceFromTextInput = false,
    bands = 4,
    limit = 2,
    confirmCopyTimer;

  document.body.classList.remove('no-js');

  const resistance_input_element = document.getElementById('resistance_input');
  const exponent_element = document.getElementById('exponent');
  const multiplier_element = document.getElementById('multiplier');
  const tolerance_element = document.getElementById('tolerance');
  const error_exponent_element = document.getElementById('error_exponent');
  const error_exponent_text_element = document.getElementById('error_exponent_text');
  const same_unit_checkbox_element = document.getElementById('same_unit_checkbox');
  const error_element = document.getElementById('error');
  const tcr_element = document.getElementById('tcr');
  const text_element = document.getElementById('text');
  const bands_element = document.getElementById('bands');
  const band_3_element = document.getElementById('band_3');
  const third_band_element = document.getElementById('third_band');
  const tcr_band_element = document.getElementById('tcr_band');
  const tolerance_band_element = document.getElementById('tolerance_band');
  const band_tolerance_element = document.getElementById('band_tolerance');
  const band_tcr_element = document.getElementById('band_tcr');
  const tolerance_display_element = document.getElementById('tolerance_display');
  const digit_elements = [0, 1, 2].map(n => document.getElementById(`digit_${n}`));
  const band_elements = [0, 1, 2].map(n => document.getElementById(`band_${n}`));
  const checkbox_element = document.getElementById('checkbox');
  const copy_button_element = document.getElementById('copy_button');
  const confirm_copy_element = document.getElementById('confirm_copy');
  const tcr_display_element = document.getElementById('tcr_display');
  const tolerance_mode_element = document.getElementById('tolerance_mode');
  const reset_button_element = document.getElementById('reset_button');

  const COLORS = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'];
  const MULTIPLIERS = ['Pink', 'Silver', 'Gold', ...COLORS];
  const TCR_VALUES = [250, 100, 50, 15, 25, 20, 10, 5, 1];
  const LEGACY_TOLERANCES = [0.1, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];
  const NEW_TOLERANCES = [0.1, 0.05, 0.01, 0.02, 0.0005, 0.0002, 0.005, 0.0025, 0.001, 0.0001];
  const SUFFIXES = ['µ', 'm', '', 'k', 'M', 'G', 'T'];

  function format(number, index) {
    index ??= Math.max(-2, Math.min(Math.floor(Math.log10(number) / 3), SUFFIXES.length - 3));

    return `${+(number / 10 ** (3 * index)).toFixed(6)} ${SUFFIXES[index + 2]}Ω`;
  }

  const DARK_COLORS = new Set(['Black', 'Brown', 'Red', 'Green', 'Blue', 'Grey']);

  function changeColor(dropdownElement, bandElement, color) {
    dropdownElement.style.backgroundColor = color;
    dropdownElement.style.color = DARK_COLORS.has(color) ? 'white' : 'black';
    dropdownElement.classList.remove('mandatory');

    if (bandElement) {
      bandElement.style.backgroundColor = color;
    }
  }

  function buildToleranceOptions(list) {
    tolerance_element.replaceChildren(Object.assign(new Option('Select a color', ''), { disabled: true, hidden: true, defaultSelected: true }), ...list.map(color => new Option(color, color)));
  }

  reset_button_element.addEventListener('pointerdown', () => {
    resetting = true;
  });

  ['pointerup', 'pointercancel'].forEach(event => {
    window.addEventListener(event, () => setTimeout(() => { resetting = false; }, 0));
  });

  document.getElementById('main_form').addEventListener('reset', () => {
    digits.fill(undefined);
    multiplier = undefined;
    tolerance = undefined;
    tcr = undefined;
    toleranceMode = 'Legacy';
    modeBackup = undefined;
    minInput = 0.01;
    resistanceFromTextInput = false;
    sameUnit = false;

    [
      bands_element, ...digit_elements, multiplier_element, tolerance_element, tcr_element,
      ...band_elements, band_3_element, band_tolerance_element, band_tcr_element
    ].forEach(el => {
      el.style.backgroundColor = '';
      el.style.color = '';
    });

    [...digit_elements, multiplier_element].forEach(el => el.classList.add('mandatory'));

    checkbox_element.hidden = true;
    copy_button_element.hidden = true;
    confirm_copy_element.hidden = true;
    error_element.hidden = true;
    error_exponent_element.hidden = true;

    exponent_element.classList.remove('mandatory');

    tolerance_display_element.textContent = '';
    tcr_display_element.textContent = '';

    text_element.style.fontStyle = 'italic';
    text_element.innerHTML = 'Fill all required (<span class="asterisk">*</span>) dropdowns to see the result.';

    exponent_element.style.width = '4ch';

    setTimeout(() => {
      document.getElementById('legacy').checked = true;
      tolerance_mode_element.dispatchEvent(new Event('change'));
      bands_element.dispatchEvent(new Event('change'));
      resetting = false;
    }, 0);
  });

  bands_element.addEventListener('change', () => {
    bands = +bands_element.value;

    const isStandardPrecision = bands < 5;

    third_band_element.hidden = band_elements[2].hidden = isStandardPrecision;
    tolerance_mode_element.hidden = tolerance_band_element.hidden = band_tolerance_element.hidden = bands < 4;
    tcr_band_element.hidden = band_tcr_element.hidden = bands !== 6;

    resistance_input_element.value = '';
    resistance_input_element.classList.remove('mandatory');
    error_element.hidden = true;

    resistance_input_element.min = minInput = isStandardPrecision ? 0.01 : 0.1;
    resistance_input_element.max = isStandardPrecision ? 99_000_000_000 : 999_000_000_000;
    limit = isStandardPrecision ? 2 : 3;

    resistanceFromTextInput = false;
    updateResult();
  });

  digit_elements.forEach((element, n) => {
    element.addEventListener('change', () => {
      const color = element.value;
      digits[n] = element.selectedIndex - 1;
      changeColor(element, band_elements[n], color);
      resistanceFromTextInput = false;
      updateResult();
    });
  });

  multiplier_element.addEventListener('change', () => {
    const color = multiplier_element.value;

    multiplier = multiplier_element.selectedIndex - 4;

    changeColor(multiplier_element, band_3_element, color);

    resistanceFromTextInput = false;
    updateResult();
  });

  function updateTolerance() {
    const values = toleranceMode === 'New'
      ? NEW_TOLERANCES
      : LEGACY_TOLERANCES;

    const color = tolerance_element.value;

    tolerance_display_element.hidden = false;

    tolerance = values[tolerance_element.selectedIndex - 1];

    changeColor(tolerance_element, band_tolerance_element, color);

    tolerance_display_element.textContent = `±${tolerance * 100}%`;
  }

  tolerance_element.addEventListener('change', () => {
    updateTolerance();
    updateResult();
  });

  tcr_element.addEventListener('change', () => {
    const color = tcr_element.value;

    tcr = TCR_VALUES[tcr_element.selectedIndex - 1];

    changeColor(tcr_element, band_tcr_element, color);

    tcr_display_element.textContent = `${tcr} ppm/K`;
    updateResult();
  });

  function updateResult() {
    let result, delta, number, index;

    text_element.style.fontStyle = 'normal';

    if (Number.isInteger(multiplier) && digits[0] !== undefined && digits[1] !== undefined &&
      (limit === 2 || digits[2] !== undefined)) {
      const step = 10 ** multiplier;

      copy_button_element.hidden = false;

      number = digits.slice(0, limit).join('') * step;

      if (!resistanceFromTextInput) {
        resistance_input_element.value = +number.toFixed(6);
        resistance_input_element.classList.remove('mandatory');
        error_element.hidden = true;
      }

      if (sameUnit) {
        index = Math.max(-2, Math.min(Math.floor(Math.log10(number) / 3), SUFFIXES.length - 3));
      }

      const formattedNumber = (number === 0) ? '0 Ω' : format(number, index);
      result = formattedNumber;

      const actualTolerance = (bands === 3) ? 0.2 : tolerance;
      const showRange = actualTolerance !== undefined && number !== 0;

      if (showRange) {
        checkbox_element.hidden = false;
        delta = actualTolerance * number;
        result += ` ± ${actualTolerance * 100}%`;
      } else {
        checkbox_element.hidden = true;
      }

      if (bands === 6 && tcr !== undefined) {
        result += ` ${tcr} ppm/K`;
      }

      if (showRange) {
        result += `\n${formattedNumber} ± ${format(delta, index)}`
          + `\n${format(number - delta, index)} – ${format(number + delta, index)}`;
      }

      text_element.textContent = result;

      error_exponent_element.hidden = true;
      exponent_element.classList.remove('mandatory');

      resistance_input_element.step = step;
      resistance_input_element.min = (number === 0) ? minInput : Math.max(step, minInput);
    } else {
      text_element.style.fontStyle = 'italic';
      text_element.innerHTML = 'Fill all required (<span class="asterisk">*</span>) dropdowns to see the result.';
      copy_button_element.hidden = true;
      checkbox_element.hidden = true;
    }

    confirm_copy_element.hidden = true;

    if (multiplier !== undefined) {
      exponent_element.value = multiplier;
      error_exponent_element.hidden = true;
      exponent_element.classList.remove('mandatory');
      exponent_element.style.width = `${Math.max(exponent_element.value.length + 3, 4)}ch`;
    }
  }

  tolerance_mode_element.addEventListener('change', (e) => {
    const optionsList = ['Silver', 'Gold', 'Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey'];

    toleranceMode = e.target.value;

    if (toleranceMode === 'New') {
      optionsList.splice(4, 0, 'Orange', 'Yellow');
    }

    const index = optionsList.indexOf(tolerance_element.value) + 1;

    if (index === 0 && tolerance_element.selectedIndex !== 0 && modeBackup === undefined) {
      modeBackup = tolerance_element.value;
    }

    buildToleranceOptions(optionsList);

    tolerance_element.selectedIndex = index;

    if (index === 0) {
      if (toleranceMode === 'New' && modeBackup !== undefined) {
        tolerance_element.value = modeBackup;
        modeBackup = undefined;
        updateTolerance();
        updateResult();
        return;
      }

      tolerance_display_element.hidden = true;
      tolerance = undefined;
      tolerance_element.style.backgroundColor = '';
      tolerance_element.style.color = '';
    } else {
      updateTolerance();
    }

    updateResult();
  });

  function validateInput(input, errorContainer, errorText, fieldName, customValidation = () => true) {
    if (input.value === '') {
      const badInput = input.validity.badInput;

      if (badInput) {
        (errorText || errorContainer).textContent = 'Invalid input';
      }

      errorContainer.hidden = !badInput;
      input.classList.toggle('mandatory', badInput);
      return false;
    }

    const isValid = input.checkValidity() && customValidation();

    errorContainer.hidden = isValid;
    input.classList.toggle('mandatory', !isValid);

    if (!isValid) {
      (errorText || errorContainer).textContent = `Invalid ${fieldName} value`;
    }

    return isValid;
  }

  resistance_input_element.addEventListener('input', () => {
    resistance_input_element.step = 0.001;
    resistance_input_element.min = minInput;

    const isValid = validateInput(resistance_input_element, error_element, null, 'resistance', () => {
      const resistanceValue = Number(resistance_input_element.value);
      return Object.is(resistanceValue, 0) || resistance_input_element.value.replace('.', '').replace(/e.*/i, '').replace(/^0+|0+$/g, '').length <= limit;
    });

    if (resistance_input_element.value === '') {
      resistanceFromTextInput = false;
      return;
    }

    if (isValid) {
      resistanceFromTextInput = true;

      const resistanceValue = Number(resistance_input_element.value);
      const resistanceString = resistanceValue.toExponential(limit - 1).split('e')[0].replace('.', '');

      for (let i = 0; i < limit; ++i) {
        digits[i] = +resistanceString[i];
        const color = COLORS[digits[i]];
        digit_elements[i].value = color;
        changeColor(digit_elements[i], band_elements[i], color);
      }

      multiplier = (resistanceValue > 0) ? Math.floor(Math.log10(resistanceValue)) - limit + 1 : 0;

      const color = MULTIPLIERS[3 + multiplier];

      multiplier_element.value = color;

      changeColor(multiplier_element, band_3_element, color);

      updateResult();
    }
  });

  resistance_input_element.addEventListener('blur', () => {
    if (!resetting && resistance_input_element.value === '') {
      resistanceFromTextInput = false;
      updateResult();
    }
  });

  same_unit_checkbox_element.addEventListener('change', () => {
    sameUnit = same_unit_checkbox_element.checked;
    updateResult();
  });

  exponent_element.addEventListener('input', () => {
    const exponent = exponent_element.value;

    exponent_element.style.width = `${Math.max(exponent.length + 3, 4)}ch`;

    if (validateInput(exponent_element, error_exponent_element, error_exponent_text_element, 'exponent')) {
      multiplier = Number(exponent);
      multiplier_element.selectedIndex = multiplier + 4;
      const color = multiplier_element.value;
      changeColor(multiplier_element, band_3_element, color);
      resistanceFromTextInput = false;
      updateResult();
    }
  });

  exponent_element.addEventListener('blur', () => {
    if (!resetting && exponent_element.value === '') {
      multiplier = multiplier_element.selectedIndex > 0
        ? multiplier_element.selectedIndex - 4
        : undefined;
      updateResult();
    }
  });

  document.getElementById('copy_result').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text_element.textContent);

      confirm_copy_element.hidden = false;

      clearTimeout(confirmCopyTimer);

      confirmCopyTimer = setTimeout(() => {
        confirm_copy_element.hidden = true;
      }, 2000);
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  });
});
