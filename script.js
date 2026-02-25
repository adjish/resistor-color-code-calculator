'use strict';

function format(number, index) {
  if (number === 0) {
    return '0 Ω';
  }

  const suffixes = ['µ', 'm', '', 'k', 'M', 'G', 'T'];

  index ??= Math.floor(Math.log10(number) / 3);
  number /=  10 ** (3 * index);

  return (
    `${parseFloat(number.toFixed(6))} ${suffixes[index + 2]}Ω`
  );
}

function changeColor(element, color) {
  element.style.backgroundColor = color;
  element.style.color = ['Black', 'Brown', 'Red', 'Green', 'Blue', 'Grey'].includes(color) ?
    'white' : 'black';
  element.classList.remove('mandatory');
}

document.addEventListener('DOMContentLoaded', () => {
  let digits = new Array(3),
    multiplier,
    tolerance,
    tcr,
    toleranceBackup,
    toleranceMode,
    modeBackup,
    minInput = 0.01,
    sameUnit = false,
    resistanceFromTextInput = false,
    bands = 4;

  document.body.classList.remove('no-js');

  let resistance_input_element = document.getElementById('resistance_input');
  let exponent_element = document.getElementById('exponent');
  let multiplier_element = document.getElementById('multiplier');
  let tolerance_element = document.getElementById('tolerance');
  let error_exponent_element = document.getElementById('error_exponent');
  let same_unit_checkbox_element = document.getElementById('same_unit_checkbox');
  let error_element = document.getElementById('error');
  let tcr_element = document.getElementById('tcr');
  let text_element = document.getElementById('text');
  let bands_element = document.getElementById('bands');

  document.getElementById('reset_button').addEventListener('click', () => {
    window.location.assign(window.location.href);
  });

  bands_element.addEventListener('change', () => {
    bands = parseInt(bands_element.value, 10);

    const visibilities = {
      3: ['none', 'none', 'none', 'none', 'none', 'none'],
      4: ['none', 'none', 'unset', 'none', 'inline-block', 'none'],
      5: ['unset', 'none', 'unset', 'inline-block', 'inline-block', 'none'],
      6: ['unset', 'unset', 'unset', 'inline-block', 'inline-block', 'inline-block']
    }

    const values = visibilities[bands];

    document.getElementById('third_band').style.display = values[0];
    document.getElementById('tcr_band').style.display = values[1];
    document.getElementById('tolerance_band').style.display = values[2];
    document.getElementById('band_2').style.display = values[3];
    document.getElementById('band_tolerance').style.display = values[4];
    document.getElementById('band_tcr').style.display = values[5];
    resistance_input_element.value = '';

    resistance_input_element.min = minInput = (bands >= 5 ? 0.1 : 0.01);
    resistance_input_element.max = (bands >= 5 ? 999000000000 : 99000000000);

    resistanceFromTextInput = false;
  });

  [0, 1, 2].forEach(function(n) {
    let element = document.getElementById(`digit_${n}`);

    element.addEventListener('change', () => {
      let index = element.selectedIndex;
      let color = element.options[index].value;

      digits[n] = index - 1;

      document.getElementById(`band_${n}`).style.backgroundColor = color;

      changeColor(element, color);

      resistanceFromTextInput = false;
    });
  });

  multiplier_element.addEventListener('change', () => {
    let index = multiplier_element.selectedIndex;
    let color = multiplier_element.options[index].value;

    multiplier = index - 4;

    document.getElementById('band_3').style.backgroundColor = color;

    changeColor(multiplier_element, color);

    resistanceFromTextInput = false;
  });

  function updateTolerance() {
    let values = [0.1, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];

    if (toleranceMode === 'New') {
      values = [0.1, 0.05, 0.01, 0.02, 0.0005, 0.0002, 0.005, 0.0025, 0.001, 0.0001];
    }

    let index = tolerance_element.selectedIndex;
    let color = tolerance_element.options[index].value;

    document.getElementById('tolerance_display').style.display = 'inline';

    tolerance = values[index - 1];

    document.getElementById('band_tolerance').style.backgroundColor = color;

    changeColor(tolerance_element, color);

    document.getElementById('tolerance_display').innerHTML = `${tolerance * 100}%`;
  }

  tolerance_element.addEventListener('change',
    updateTolerance
  );

  tcr_element.addEventListener('change', () => {
    const values = [250, 100, 50, 15, 25, 20, 10, 5, 1];

    let index = tcr_element.selectedIndex;
    let color = tcr_element.options[index].value;

    tcr = values[index - 1];

    document.getElementById('band_tcr').style.backgroundColor = color;

    changeColor(tcr_element, color);

    document.getElementById('tcr_display').innerHTML = `${tcr}ppm/K`;
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
        resistance_input_element.value = parseFloat(number.toFixed(6));
        resistance_input_element.classList.remove('mandatory');
        error_element.classList.add('hidden');
      }

      toleranceBackup = tolerance;

      if (sameUnit) {
        index = Math.floor(Math.log10(number) / 3);
      }

      if (bands === 3) {
        tolerance = 0.2;
      }

      if (tolerance !== undefined && number) {
        document.getElementById('checkbox').classList.remove('hidden');
        error = tolerance * number;
        result2 = `${format(number, index)} ± ${format(error, index)}`;
        result += ` ± ${tolerance * 100}%`;
      } else {
        document.getElementById('checkbox').classList.add('hidden');
      }

      if (bands === 6 && tcr !== undefined) {
        result += ` ${tcr}ppm/K`;
      }

      if (result2 !== undefined) {
        result += `\n${result2}\n${format(number - error, index)} – ${format(number + error, index)}`;
      }

      text_element.textContent = result;

      tolerance = toleranceBackup;

      error_exponent_element.classList.add('hidden');
      exponent_element.style.borderStyle = 'none';

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
      exponent_element.style.borderStyle = 'none';
      exponent_element.style.width = `${exponent_element.value.length ? exponent_element.value.length + 3 : 4}ch`;
    }
  }

  document.getElementById('tolerance_mode').addEventListener('change', () => {
    let optionsList = ['Silver', 'Gold', 'Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey'];
    let index;

    toleranceMode = document.querySelector('input[name="mode"]:checked').value;

    const select = tolerance_element;

    if (toleranceMode === 'New') {
      optionsList.splice(4, 0, 'Orange', 'Yellow');
    }

    index = optionsList.indexOf(tolerance_element.value) + 1;

    if (index === 0 && tolerance_element.selectedIndex !== 0 && modeBackup === undefined) {
      modeBackup = tolerance_element.selectedIndex;
    }

    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.text = 'Select a colour';
    defaultOption.hidden = true;
    select.appendChild(defaultOption);

    optionsList.forEach(text => {
      const option = document.createElement('option');
      option.text = text;
      select.appendChild(option);
    });

    tolerance_element.selectedIndex = index;

    if (index === 0) {
      if (toleranceMode === 'New' && modeBackup !== undefined) {
        tolerance_element.selectedIndex = modeBackup;
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
    let color, limit = (bands >= 5 ? 3 : 2);
    let resistance = resistance_input_element.value.trim();
    let resistanceString = String(resistance).replace(/\./g, '').replace(/^0+/, '').padEnd(limit, '0');
    let resistanceLength = resistanceString.replace(/0+$/, '').length;

    resistance_input_element.step = 0.001;
    resistance_input_element.min = minInput;

    if (!resistance.length || ((!resistance_input_element.checkValidity() ||
      (resistanceLength > limit)) && Number(resistance) !== 0)) {
      error_element.classList.remove('hidden');
      resistance_input_element.classList.add('mandatory');
      return;
    }

    resistanceFromTextInput = true;

    const colours = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'];
    const multipliers = ['Pink', 'Silver', 'Gold'].concat(colours);

    let element;

    for (let i = 0; i < limit; ++i) {
      element = document.getElementById(`digit_${i}`);
      digits[i] = resistanceString[i];
      color = colours[digits[i]];
      element.value = color;
      changeColor(element, color);
      document.getElementById(`band_${i}`).style.backgroundColor = color;
    }

    multiplier = (resistance > 0) ? Math.floor(Math.log10(resistance)) - limit + 1 : 0;

    color = multipliers[3 + multiplier];

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
    let color, exponent = Number(exponent_element.value);

    exponent_element.style.width = `${exponent_element.value.length ? exponent_element.value.length + 3 : 4}ch`;

    if (exponent_element.checkValidity()) {
      multiplier = Number(exponent);
      multiplier_element.selectedIndex = multiplier + 4;
      color = multiplier_element.value;

      error_exponent_element.classList.add('hidden');
      exponent_element.style.borderStyle = 'none';
      document.getElementById('band_3').style.backgroundColor = color;

      changeColor(multiplier_element, color);

      resistanceFromTextInput = false;

      updateResult();
    } else {
      error_exponent_element.classList.remove('hidden');
      exponent_element.style.border = '1px solid #f00';
    }
  });

  document.getElementById('copy_result').addEventListener('click', () => {
    navigator.clipboard.writeText(text_element.textContent);
    document.getElementById('confirm_copy').classList.remove('hidden');
  });
});
