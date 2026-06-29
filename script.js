'use strict';

document.addEventListener('DOMContentLoaded', () => {
  let digits = new Array(3).fill(undefined),
    multiplier,
    tolerance,
    tcr,
    toleranceMode = 'Legacy',
    modeBackup,
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

  const COLORS = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'];
  const MULTIPLIERS = ['Pink', 'Silver', 'Gold', ...COLORS];
  const TCR_VALUES = [250, 100, 50, 15, 25, 20, 10, 5, 1];
  const LEGACY_TOLERANCES = [0.1, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];
  const NEW_TOLERANCES = [0.1, 0.05, 0.01, 0.02, 0.0005, 0.0002, 0.005, 0.0025, 0.001, 0.0001];
  const VISIBILITIES = {
    3: ['none',  'none',  'none', 'none',         'none',         'none'        ],
    4: ['none',  'none',  '',     'none',         'inline-block', 'none'        ],
    5: ['block', 'none',  '',     'inline-block', 'inline-block', 'none'        ],
    6: ['block', 'block', '',     'inline-block', 'inline-block', 'inline-block']
  };

  const SUFFIXES = ['µ', 'm', '', 'k', 'M', 'G', 'T'];

  function format(number, index) {
    if (number === 0) {
      return '0 Ω';
    }

    index ??= Math.floor(Math.log10(number) / 3);
    number /=  10 ** (3 * index);

    return (
      `${+number.toFixed(6)} ${SUFFIXES[index + 2]}Ω`
    );
  }

  const DARK_COLORS = new Set(['Black', 'Brown', 'Red', 'Green', 'Blue', 'Grey']);

  function changeColor(element, color) {
    element.style.backgroundColor = color;
    element.style.color = DARK_COLORS.has(color) ? 'white' : 'black';
    element.classList.remove('mandatory');
  }

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

    const selectIds = [
      'bands',
      'digit_0',
      'digit_1',
      'digit_2',
      'multiplier',
      'tolerance',
      'tcr'
    ];

    selectIds.forEach(id => {
      const el = document.getElementById(id);

      el.style.backgroundColor = '';
      el.style.color = '';
    });

    const mandatoryIds = [
      'digit_0',
      'digit_1',
      'digit_2',
      'multiplier'
    ];

    mandatoryIds.forEach(id => {
      document.getElementById(id).classList.add('mandatory');
    });

    resistance_input_element.classList.remove('mandatory');
    exponent_element.classList.remove('mandatory');

    const bandIds = [
      'band_0',
      'band_1',
      'band_2',
      'band_3',
      'band_tolerance',
      'band_tcr'
    ];

    bandIds.forEach(id => {
      document.getElementById(id).style.backgroundColor = '';
    });

    document.getElementById('checkbox').classList.add('hidden');
    document.getElementById('copy_button').classList.add('hidden');
    document.getElementById('confirm_copy').classList.add('hidden');
    error_element.classList.add('hidden');
    error_exponent_element.classList.add('hidden');

    document.getElementById('tolerance_display').textContent = '';
    document.getElementById('tcr_display').textContent = '';

    text_element.style.fontStyle = 'italic';
    text_element.innerHTML = 'Fill all required (<span class="asterisk">*</span>) dropdowns to see the result.';

    exponent_element.style.width = '4ch';

    setTimeout(() => {
      document.getElementById('tolerance_mode').dispatchEvent(new Event('change'));
      bands_element.dispatchEvent(new Event('change'));
    }, 0);
  });

  bands_element.addEventListener('change', () => {
    bands = parseInt(bands_element.value, 10);

    const values = VISIBILITIES[bands];

    document.getElementById('third_band').style.display = values[0];
    document.getElementById('tcr_band').style.display = values[1];
    document.getElementById('tolerance_band').style.display = values[2];
    document.getElementById('band_2').style.display = values[3];
    document.getElementById('band_tolerance').style.display = values[4];
    document.getElementById('band_tcr').style.display = values[5];
    resistance_input_element.value = '';
    resistance_input_element.classList.remove('mandatory');
    error_element.classList.add('hidden');

    resistance_input_element.min = minInput = (bands >= 5 ? 0.1 : 0.01);
    resistance_input_element.max = (bands >= 5 ? 999000000000 : 99000000000);

    resistanceFromTextInput = false;
  });

  [0, 1, 2].forEach(n => {
    const element = document.getElementById(`digit_${n}`);

    element.addEventListener('change', () => {
      const index = element.selectedIndex;
      const color = element.options[index].value;

      digits[n] = index - 1;

      document.getElementById(`band_${n}`).style.backgroundColor = color;

      changeColor(element, color);

      resistanceFromTextInput = false;
    });
  });

  multiplier_element.addEventListener('change', () => {
    const index = multiplier_element.selectedIndex;
    const color = multiplier_element.options[index].value;

    multiplier = index - 4;

    document.getElementById('band_3').style.backgroundColor = color;

    changeColor(multiplier_element, color);

    resistanceFromTextInput = false;
  });

  function updateTolerance() {
    const values = toleranceMode === 'New'
      ? NEW_TOLERANCES
      : LEGACY_TOLERANCES;

    const index = tolerance_element.selectedIndex;
    const color = tolerance_element.options[index].value;

    document.getElementById('tolerance_display').style.display = 'inline';

    tolerance = values[index - 1];

    document.getElementById('band_tolerance').style.backgroundColor = color;

    changeColor(tolerance_element, color);

    document.getElementById('tolerance_display').textContent = `±${tolerance * 100}%`;
  }

  tolerance_element.addEventListener('change',
    updateTolerance
  );

  tcr_element.addEventListener('change', () => {
    const color = tcr_element.value;

    tcr = TCR_VALUES[tcr_element.selectedIndex - 1];

    document.getElementById('band_tcr').style.backgroundColor = color;

    changeColor(tcr_element, color);

    document.getElementById('tcr_display').textContent = `${tcr} ppm/K`;
  });

  function updateResult() {
    let result, result2, error, number, index;

    text_element.style.fontStyle = 'normal';

    if (digits[0] !== undefined && digits[1] !== undefined && Number.isInteger(multiplier) &&
      (bands < 5 || digits[2] !== undefined)) {
      document.getElementById('copy_button').classList.remove('hidden');

      number = Number(digits.slice(0, bands >= 5 ? 3 : 2).join('')) * 10 ** multiplier;

      result = format(number);

      if (!resistanceFromTextInput) {
        resistance_input_element.value = +number.toFixed(6);
        resistance_input_element.classList.remove('mandatory');
        error_element.classList.add('hidden');
      }

      if (sameUnit) {
        index = Math.floor(Math.log10(number) / 3);
      }

      const actualTolerance = (bands === 3) ? 0.2 : tolerance;

      if (actualTolerance !== undefined && number !== 0) {
        document.getElementById('checkbox').classList.remove('hidden');
        error = actualTolerance * number;
        result2 = `${format(number, index)} ± ${format(error, index)}`;
        result += ` ± ${actualTolerance * 100}%`;
      } else {
        document.getElementById('checkbox').classList.add('hidden');
      }

      if (bands === 6 && tcr !== undefined) {
        result += ` ${tcr} ppm/K`;
      }

      if (result2 !== undefined) {
        result += `\n${result2}\n${format(number - error, index)} – ${format(number + error, index)}`;
      }

      text_element.textContent = result;

      error_exponent_element.classList.add('hidden');
      exponent_element.classList.remove('mandatory');

      resistance_input_element.step = 10 ** multiplier;
      resistance_input_element.min = Math.max(10 ** multiplier, minInput);

      if (number === 0) {
        resistance_input_element.min = minInput;
      }
    } else {
      text_element.style.fontStyle = 'italic';
      text_element.innerHTML = 'Fill all required (<span class="asterisk">*</span>) dropdowns to see the result.';
      document.getElementById('copy_button').classList.add('hidden');
      document.getElementById('checkbox').classList.add('hidden');
    }

    document.getElementById('confirm_copy').classList.add('hidden');

    if (multiplier !== undefined) {
      exponent_element.value = multiplier;
      error_exponent_element.classList.add('hidden');
      exponent_element.classList.remove('mandatory');
      exponent_element.style.width = `${Math.max(exponent_element.value.length + 3, 4)}ch`;
    }
  }

  document.getElementById('tolerance_mode').addEventListener('change', () => {
    let optionsList = ['Silver', 'Gold', 'Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey'];

    toleranceMode = document.querySelector('input[name="mode"]:checked').value;

    if (toleranceMode === 'New') {
      optionsList.splice(4, 0, 'Orange', 'Yellow');
    }

    const index = optionsList.indexOf(tolerance_element.value) + 1;

    if (index === 0 && tolerance_element.selectedIndex !== 0 && modeBackup === undefined) {
      modeBackup = tolerance_element.value;
    }

    tolerance_element.replaceChildren();

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.hidden = true;
    defaultOption.text = 'Select a color';
    tolerance_element.appendChild(defaultOption);

    optionsList.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.text = color;
      tolerance_element.appendChild(option);
    });

    tolerance_element.selectedIndex = index;

    if (index === 0) {
      if (toleranceMode === 'New' && modeBackup !== undefined) {
        tolerance_element.value = modeBackup;
        modeBackup = undefined;
        updateTolerance();
        updateResult();
        return;
      }

      document.getElementById('tolerance_display').style.display = 'none';

      tolerance = undefined;
      tolerance_element.style.backgroundColor = '';
      tolerance_element.style.color = '';
    } else {
      updateTolerance();
    }

    updateResult();
  });

  document.querySelectorAll('select').forEach((element) => {
    element.addEventListener(
      'change', updateResult
    );
  });

  resistance_input_element.addEventListener('input', () => {
    const limit = (bands >= 5 ? 3 : 2);
    const resistance = resistance_input_element.value;
    const resistanceString = resistance.replaceAll('.', '').replace(/^0+/, '').padEnd(limit, '0');
    let color;

    resistance_input_element.step = 0.001;
    resistance_input_element.min = minInput;

    if (resistance.length === 0 || ((!resistance_input_element.checkValidity() ||
      (resistanceString.replace(/0+$/, '').length > limit)) && Number(resistance) !== 0)) {
      if (resistance.length) {
        error_element.textContent = 'Invalid resistance value';
      }
      else {
        error_element.textContent = 'Invalid input';
      }

      error_element.classList.remove('hidden');
      resistance_input_element.classList.add('mandatory');
      return;
    }

    resistanceFromTextInput = true;

    for (let i = 0; i < limit; ++i) {
      const element = document.getElementById(`digit_${i}`);
      digits[i] = +resistanceString[i];
      color = COLORS[digits[i]];
      element.value = color;
      changeColor(element, color);
      document.getElementById(`band_${i}`).style.backgroundColor = color;
    }

    multiplier = (Number(resistance) > 0) ? Math.floor(Math.log10(Number(resistance))) - limit + 1 : 0;

    color = MULTIPLIERS[3 + multiplier];

    if (color === undefined) {
      error_element.classList.remove('hidden');
      resistance_input_element.classList.add('mandatory');
      return;
    }

    error_element.classList.add('hidden');
    resistance_input_element.classList.remove('mandatory');

    multiplier_element.value = color;
    document.getElementById('band_3').style.backgroundColor = color;

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

      error_exponent_element.classList.add('hidden');
      exponent_element.classList.remove('mandatory');
      document.getElementById('band_3').style.backgroundColor = color;

      changeColor(multiplier_element, color);

      resistanceFromTextInput = false;

      updateResult();
    } else {
      error_exponent_element.classList.remove('hidden');
      exponent_element.classList.add('mandatory');
    }
  });

  async function writeClipboardText() {
    try {
      await navigator.clipboard.writeText(text_element.textContent);
      document.getElementById('confirm_copy').classList.remove('hidden');
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  }

  document.getElementById('copy_result').addEventListener('click', writeClipboardText);
});
