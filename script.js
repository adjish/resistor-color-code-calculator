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
    bands = 4;

  document.body.classList.remove('no-js');

  const resistance_input_element = document.getElementById('resistance_input');
  const exponent_element = document.getElementById('exponent');
  const multiplier_element = document.getElementById('multiplier');
  const tolerance_element = document.getElementById('tolerance');
  const error_exponent_element = document.getElementById('error_exponent');
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

  const COLORS = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'];
  const MULTIPLIERS = ['Pink', 'Silver', 'Gold', ...COLORS];
  const TCR_VALUES = [250, 100, 50, 15, 25, 20, 10, 5, 1];
  const LEGACY_TOLERANCES = [0.1, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];
  const NEW_TOLERANCES = [0.1, 0.05, 0.01, 0.02, 0.0005, 0.0002, 0.005, 0.0025, 0.001, 0.0001];
  const VISIBILITIES = {
    3: [false, false, false, false, false, false],
    4: [false, false, true,  false, true,  false],
    5: [true,  false, true,  true,  true,  false],
    6: [true,  true,  true,  true,  true,  true]
  };

  const SUFFIXES = ['µ', 'm', '', 'k', 'M', 'G', 'T'];

  function format(number, index) {
    if (number === 0) {
      return '0 Ω';
    }

    index ??= Math.floor(Math.log10(number) / 3);
    number /=  10 ** (3 * index);

    return `${+number.toFixed(6)} ${SUFFIXES[index + 2]}Ω`;
  }

  const DARK_COLORS = new Set(['Black', 'Brown', 'Red', 'Green', 'Blue', 'Grey']);

  function changeColor(element, color) {
    element.style.backgroundColor = color;
    element.style.color = DARK_COLORS.has(color) ? 'white' : 'black';
    element.classList.remove('mandatory');
  }

  function buildToleranceOptions(list) {
    tolerance_element.replaceChildren();
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.hidden = true;
    defaultOption.text = 'Select a color';
    tolerance_element.appendChild(defaultOption);

    list.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.text = color;
      tolerance_element.appendChild(option);
    });
  }

  document.getElementById('main_form').addEventListener('reset', () => {
    resetting = true;
    digits.fill(undefined);
    multiplier = undefined;
    tolerance = undefined;
    tcr = undefined;
    toleranceMode = 'Legacy';
    modeBackup = undefined;
    minInput = 0.01;
    resistanceFromTextInput = false;
    sameUnit = false;

    [bands_element, ...digit_elements, multiplier_element, tolerance_element, tcr_element].forEach(el => {
      el.style.backgroundColor = '';
      el.style.color = '';
    });

    [...digit_elements, multiplier_element].forEach(el => el.classList.add('mandatory'));

    [...band_elements, band_3_element, band_tolerance_element, band_tcr_element].forEach(el => {
      el.style.backgroundColor = '';
    });

    document.getElementById('checkbox').hidden = true;
    document.getElementById('copy_button').hidden = true;
    document.getElementById('confirm_copy').hidden = true;
    error_element.hidden = true;
    error_exponent_element.hidden = true;

    tolerance_display_element.textContent = '';
    document.getElementById('tcr_display').textContent = '';

    text_element.style.fontStyle = 'italic';
    text_element.innerHTML = 'Fill all required (<span class="asterisk">*</span>) dropdowns to see the result.';

    exponent_element.style.width = '4ch';

    setTimeout(() => {
      document.getElementById('legacy').checked = true;
      document.getElementById('tolerance_mode').dispatchEvent(new Event('change'));
      bands_element.dispatchEvent(new Event('change'));
      resetting = false;
    }, 0);
  });

  bands_element.addEventListener('change', () => {
    bands = parseInt(bands_element.value, 10);

    const values = VISIBILITIES[bands];

    third_band_element.hidden = !values[0];
    tcr_band_element.hidden = !values[1];
    tolerance_band_element.hidden = !values[2];
    band_elements[2].hidden = !values[3];
    band_tolerance_element.hidden = !values[4];
    band_tcr_element.hidden = !values[5];
    resistance_input_element.value = '';
    resistance_input_element.classList.remove('mandatory');
    error_element.hidden = true;

    resistance_input_element.min = minInput = (bands >= 5 ? 0.1 : 0.01);
    resistance_input_element.max = (bands >= 5 ? 999000000000 : 99000000000);

    resistanceFromTextInput = false;
  });

  digit_elements.forEach((element, n) => {
    element.addEventListener('change', () => {
      const color = element.value;
      digits[n] = element.selectedIndex - 1;
      band_elements[n].style.backgroundColor = color;
      changeColor(element, color);
      resistanceFromTextInput = false;
    });
  });

  multiplier_element.addEventListener('change', () => {
    const color = multiplier_element.value;

    multiplier = multiplier_element.selectedIndex - 4;

    band_3_element.style.backgroundColor = color;

    changeColor(multiplier_element, color);

    resistanceFromTextInput = false;
  });

  function updateTolerance() {
    const values = toleranceMode === 'New'
      ? NEW_TOLERANCES
      : LEGACY_TOLERANCES;

    const color = tolerance_element.value;

    tolerance_display_element.hidden = false;

    tolerance = values[tolerance_element.selectedIndex - 1];

    band_tolerance_element.style.backgroundColor = color;

    changeColor(tolerance_element, color);

    tolerance_display_element.textContent = `±${tolerance * 100}%`;
  }

  tolerance_element.addEventListener('change', updateTolerance);

  tcr_element.addEventListener('change', () => {
    const color = tcr_element.value;

    tcr = TCR_VALUES[tcr_element.selectedIndex - 1];

    band_tcr_element.style.backgroundColor = color;

    changeColor(tcr_element, color);

    document.getElementById('tcr_display').textContent = `${tcr} ppm/K`;
  });

  function updateResult() {
    let result, result2, delta, number, index;

    text_element.style.fontStyle = 'normal';

    if (digits[0] !== undefined && digits[1] !== undefined && Number.isInteger(multiplier) &&
      (bands < 5 || digits[2] !== undefined)) {
      document.getElementById('copy_button').hidden = false;

      number = Number(digits.slice(0, bands >= 5 ? 3 : 2).join('')) * 10 ** multiplier;

      result = format(number);

      if (!resistanceFromTextInput) {
        resistance_input_element.value = +number.toFixed(6);
        resistance_input_element.classList.remove('mandatory');
        error_element.hidden = true;
      }

      if (sameUnit) {
        index = Math.floor(Math.log10(number) / 3);
      }

      const actualTolerance = (bands === 3) ? 0.2 : tolerance;

      if (actualTolerance !== undefined && number !== 0) {
        document.getElementById('checkbox').hidden = false;
        delta = actualTolerance * number;
        result2 = `${format(number, index)} ± ${format(delta, index)}`;
        result += ` ± ${actualTolerance * 100}%`;
      } else {
        document.getElementById('checkbox').hidden = true;
      }

      if (bands === 6 && tcr !== undefined) {
        result += ` ${tcr} ppm/K`;
      }

      if (result2 !== undefined) {
        result += `\n${result2}\n${format(number - delta, index)} – ${format(number + delta, index)}`;
      }

      text_element.textContent = result;

      error_exponent_element.hidden = true;
      exponent_element.classList.remove('mandatory');

      resistance_input_element.step = 10 ** multiplier;
      resistance_input_element.min = Math.max(10 ** multiplier, minInput);

      if (number === 0) {
        resistance_input_element.min = minInput;
      }
    } else {
      text_element.style.fontStyle = 'italic';
      text_element.innerHTML = 'Fill all required (<span class="asterisk">*</span>) dropdowns to see the result.';
      document.getElementById('copy_button').hidden = true;
      document.getElementById('checkbox').hidden = true;
    }

    document.getElementById('confirm_copy').hidden = true;

    if (multiplier !== undefined) {
      exponent_element.value = multiplier;
      error_exponent_element.hidden = true;
      exponent_element.classList.remove('mandatory');
      exponent_element.style.width = `${Math.max(exponent_element.value.length + 3, 4)}ch`;
    }
  }

  document.getElementById('tolerance_mode').addEventListener('change', () => {
    const optionsList = ['Silver', 'Gold', 'Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey'];

    toleranceMode = document.querySelector('input[name="mode"]:checked').value;

    if (resetting) {
      buildToleranceOptions(optionsList);

      tolerance_element.selectedIndex = 0;
      tolerance = undefined;
      modeBackup = undefined;
      tolerance_display_element.hidden = true;
      tolerance_display_element.textContent = '';
      return;
    }

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

  document.querySelectorAll('select').forEach((element) => {
    element.addEventListener('change', updateResult);
  });

  resistance_input_element.addEventListener('input', () => {
    const limit = (bands >= 5 ? 3 : 2);
    const resistance = resistance_input_element.value;

    resistance_input_element.step = 0.001;
    resistance_input_element.min = minInput;

    if (resistance.length === 0) {
      if (resistance_input_element.validity.badInput) {
        error_element.textContent = 'Invalid resistance value';
        error_element.hidden = false;
        resistance_input_element.classList.add('mandatory');
        return;
      }

      error_element.hidden = true;
      resistance_input_element.classList.remove('mandatory');
      resistanceFromTextInput = false;
      return;
    }

    const resistanceString = resistance.replaceAll('.', '').replace(/^0+/, '').padEnd(limit, '0');

    if ((!resistance_input_element.checkValidity() ||
      (resistanceString.replace(/0+$/, '').length > limit)) && Number(resistance) !== 0) {
      error_element.textContent = 'Invalid resistance value';
      error_element.hidden = false;
      resistance_input_element.classList.add('mandatory');
      return;
    }

    resistanceFromTextInput = true;

    for (let i = 0; i < limit; ++i) {
      digits[i] = +resistanceString[i];
      const color = COLORS[digits[i]];
      digit_elements[i].value = color;
      changeColor(digit_elements[i], color);
      band_elements[i].style.backgroundColor = color;
    }

    multiplier = (Number(resistance) > 0) ? Math.floor(Math.log10(Number(resistance))) - limit + 1 : 0;

    const color = MULTIPLIERS[3 + multiplier];

    if (color === undefined) {
      error_element.hidden = false;
      resistance_input_element.classList.add('mandatory');
      return;
    }

    error_element.hidden = true;
    resistance_input_element.classList.remove('mandatory');

    multiplier_element.value = color;
    band_3_element.style.backgroundColor = color;

    changeColor(multiplier_element, color);

    updateResult();
  });

  same_unit_checkbox_element.addEventListener('change', () => {
    sameUnit = same_unit_checkbox_element.checked;
    updateResult();
  });

  exponent_element.addEventListener('input', () => {
    exponent_element.style.width = `${Math.max(exponent_element.value.length + 3, 4)}ch`;

    if (exponent_element.checkValidity()) {
      multiplier = Number(exponent_element.value);
      multiplier_element.selectedIndex = multiplier + 4;
      const color = multiplier_element.value;

      error_exponent_element.hidden = true;
      exponent_element.classList.remove('mandatory');
      band_3_element.style.backgroundColor = color;

      changeColor(multiplier_element, color);

      resistanceFromTextInput = false;

      updateResult();
    } else {
      error_exponent_element.hidden = false;
      exponent_element.classList.add('mandatory');
    }
  });

  async function writeClipboardText() {
    try {
      await navigator.clipboard.writeText(text_element.textContent);
      document.getElementById('confirm_copy').hidden = false;
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  }

  document.getElementById('copy_result').addEventListener('click', writeClipboardText);
});
