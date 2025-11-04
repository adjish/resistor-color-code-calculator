function format (number, index) {
  if (number === 0)
  {
    return '0 Ω';
  }

  const suffixes = ['µ', 'm', '', 'k', 'M', 'G', 'T'];

  if (index === undefined)
  {
    index = Math.floor(Math.log10(number) / 3);
  }

  return (
    `${Math.round(number / 10 ** (3 * index - 6)) / 1000000} ${suffixes[index + 2]}Ω`
  );
}

function changeColor (element, color) {
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
    sameUnit = false,
    resistanceFromTextInput = false,
    bands = 4;

  document.getElementById('reset_button').addEventListener('click', () => {
    window.location.assign(window.location.href);
  });

  document.getElementById('bands').addEventListener('change', () => {
    let values = new Array(6);

    bands = parseInt(document.getElementById('bands').value, 10);

    switch (bands) {
      case 6:
        values = ['unset', 'unset', 'unset', 'inline-block', 'inline-block', 'inline-block'];
        break;
      case 5:
        values = ['unset', 'none', 'unset', 'inline-block', 'inline-block', 'none'];
        break;
      case 4:
        values = ['none', 'none', 'unset', 'none', 'inline-block', 'none'];
        break;
      default:
        values = ['none', 'none', 'none', 'none', 'none', 'none'];
    }

    document.getElementById('third_band').style.display = values[0];
    document.getElementById('tcr_band').style.display = values[1];
    document.getElementById('tolerance_band').style.display = values[2];
    document.getElementById('band_2').style.display = values[3];
    document.getElementById('band_tolerance').style.display = values[4];
    document.getElementById('band_tcr').style.display = values[5];
    document.getElementById('resistance_input').value = '';
  });

  [0, 1, 2].forEach(function (n) {
    document
      .getElementById(`digit_${n}`)
      .addEventListener('change', () => {
        let element = document.getElementById(`digit_${n}`);
        let index = element.selectedIndex;
        let color = element.options[index].text;

        digits[n] = index - 1;

        document.getElementById(`band_${n}`).style.backgroundColor = color;

        changeColor(element, color);

        resistanceFromTextInput = false;
      });
  });

  document.getElementById('multiplier').addEventListener('change', () => {
    let element = document.getElementById('multiplier');
    let index = element.selectedIndex;
    let color = element.options[index].text;

    multiplier = index - 1;

    document.getElementById('band_3').style.backgroundColor = color;

    changeColor(element, color);

    resistanceFromTextInput = false;
  });

  function updateTolerance () {
    let values = [0.1, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];

    if (toleranceMode === 'New')
    {
      values = [0.1, 0.05, 0.01, 0.02, 0.0005, 0.0002, 0.005, 0.0025, 0.001, 0.0001];
    }

    let element = document.getElementById('tolerance');
    let index = element.selectedIndex;
    let color = element.options[index].text;

    tolerance = values[index - 1];

    document.getElementById('band_tolerance').style.backgroundColor = color;

    changeColor(element, color);
  }

  document.getElementById('tolerance').addEventListener('change',
    updateTolerance
  );

  document.getElementById('tcr').addEventListener('change', () => {
    const values = [250, 100, 50, 15, 25, 20, 10, 5, 1];

    let element = document.getElementById('tcr');
    let index = element.selectedIndex;
    let color = element.options[index].text;

    tcr = values[index - 1];

    document.getElementById('band_tcr').style.backgroundColor = color;

    changeColor(element, color);
  });

  function updateResult () {
    let resistance, result, result2, error, number, index;
    let text = document.getElementById('text');

    text.style.fontStyle = 'normal';

    if (digits[0] !== undefined && digits[1] !== undefined && multiplier !== undefined &&
      (bands < 5 || digits[2] !== undefined)) {
      resistance = `${digits[0]}${digits[1]}`;

      if (bands >= 5) {
        resistance += `${digits[2]}`;
      }

      document.getElementById('copy_button').style.display = 'unset';

      number = resistance * 10 ** (multiplier - 3);

      result = format(number);

      if (!resistanceFromTextInput)
      {
        document.getElementById('resistance_input').value = Math.round(number * 1000000) / 1000000;
        document.getElementById('resistance_input').style.borderColor = '';
      }

      toleranceBackup = tolerance;

      if (sameUnit)
      {
        index = Math.floor(Math.log10(number) / 3);
      }

      if (bands === 3) {
        tolerance = 0.2;
      }

      if (tolerance !== undefined && number) {
        document.getElementById('checkbox').style.display = 'unset';
        error = tolerance * number;
        result2 = `${format(number, index)} ± ${format(error, index)}`;
        result += ` ± ${tolerance * 100}%`;
      }
      else
      {
        document.getElementById('checkbox').style.display = 'none';
      }

      if (bands === 6 && tcr !== undefined) {
        result += ` ${tcr}ppm/K`;
      }

      if (result2 !== undefined) {
        result += `\n${result2}\n${format(number - error, index)} – ${format(number + error, index)}`;
      }

      text.textContent = result;

      tolerance = toleranceBackup;

      document.getElementById('error_exponent').style.display = 'none';
      document.getElementById('exponent').style.borderStyle = 'none';
    } else {
      text.style.fontStyle = 'italic';
      text.innerHTML = 'Fill all required (<span>*</span>) dropdowns to see the result.';
      document.getElementById('copy_button').style.display = 'none';
      document.getElementById('checkbox').style.display = 'none';
    }

    document.getElementById('confirm_copy').style.display = 'none';

    if (multiplier !== undefined)
    {
      document.getElementById('exponent').value = multiplier - 3;
      document.getElementById('error_exponent').style.display = 'none';
      document.getElementById('exponent').style.borderStyle = 'none';
      document.getElementById('exponent').style.width = `${document.getElementById('exponent').value.length ? document.getElementById('exponent').value.length + 3 : 4}ch`;
    }
  }

  document.getElementById('tolerance_mode').addEventListener('change', () => {
    let optionsList = ['Silver', 'Gold', 'Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey'];
    let element = document.getElementById('tolerance');
    let index;

    const radios = document.getElementsByName('mode');

    for (const radio of radios) {
      if (radio.checked) {
        toleranceMode = radio.value;
        break;
      }
    }

    const select = document.getElementById('tolerance');

    if (toleranceMode === 'New')
    {
      optionsList.splice(4, 0, 'Orange', 'Yellow');
    }

    index = optionsList.indexOf(element.value) + 1;

    if (index === 0 && element.selectedIndex !== 0 && modeBackup === undefined)
    {
      modeBackup = element.selectedIndex;
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

    element.selectedIndex = index;

    if (index === 0)
    {
      if (toleranceMode === 'New' && modeBackup !== undefined)
      {
        element.selectedIndex = modeBackup;
        modeBackup = undefined;
        updateTolerance();
        updateResult();
        return;
      }

      tolerance = undefined;
      element.style.backgroundColor = '';
      element.style.color = '';
    }
    else
    {
      updateTolerance();
    }

    updateResult();
  });

  document.querySelectorAll('select').forEach((element) => {
    element.addEventListener(
      'change', updateResult
    );
  });

  document.getElementById('resistance_input').addEventListener('input', () => {
    let resistance = document.getElementById('resistance_input').value.trim();
    let resistanceString = String(resistance).replace(/\./g, '').replace(/^0+/, '');
    let resistanceLength = resistanceString.replace(/0+$/, '').length;

    if (Number(resistance) >= 0.01 && bands <= 4 && resistanceString.length < 2)
    {
      resistanceString = resistanceString + "0";
    }

    if (Number(resistance) >= 0.1 && bands >= 5 && resistanceString.length < 3)
    {
      resistanceString = resistanceString + "00";
    }

    if (!Number.isFinite(Number(resistance)) || resistance < 0 ||
      (bands <= 4 && (resistanceString.length < 2 || resistanceLength > 2)) ||
      (bands >= 5 && (resistanceString.length < 3 || resistanceLength > 3)))
    {
      document.getElementById('error').style.display = 'unset';
      document.getElementById('resistance_input').style.borderColor = 'red';
      return;
    }

    resistanceFromTextInput = true;

    const colours = ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'];
    const multipliers = ['Pink', 'Silver', 'Gold'].concat(colours);

    let element, color, limit = (bands >= 5 ? 2 : 1);

    for (let i = 0; i <= limit; ++i)
    {
      element = document.getElementById(`digit_${i}`);
      digits[i] = resistanceString[i];
      color = colours[digits[i]];
      element.value = color;
      changeColor(element, color);
      document.getElementById(`band_${i}`).style.backgroundColor = color;
    }

    multiplier = Math.floor(Math.log10(resistance)) + (bands >= 5 ? 1 : 2);
    color = multipliers[multiplier];

    if (color === undefined)
    {
      document.getElementById('error').style.display = 'unset';
      document.getElementById('resistance_input').style.borderColor = 'red';
      return;
    }

    document.getElementById('error').style.display = 'none';
    document.getElementById('resistance_input').style.borderColor = '';

    element = document.getElementById('multiplier');
    element.value = color;
    document.getElementById('band_3').style.backgroundColor = color;

    changeColor(element, color);

    updateResult();
  });

  document.getElementById('same_unit_checkbox').addEventListener('change', () => {
    sameUnit = document.getElementById('same_unit_checkbox').checked;
    updateResult();
  });

  document.getElementById('exponent').addEventListener('input', () => {
    let element, color, exponent = Number(document.getElementById('exponent').value);

    document.getElementById('exponent').style.width = `${document.getElementById('exponent').value.length ? document.getElementById('exponent').value.length + 3 : 4}ch`;

    if (document.getElementById('exponent').checkValidity())
    {
      multiplier = Number(exponent) + 3;
      element = document.getElementById('multiplier');
      element.selectedIndex = multiplier + 1;
      color = element.value;

      document.getElementById('error_exponent').style.display = 'none';
      document.getElementById('exponent').style.borderStyle = 'none';
      document.getElementById('band_3').style.backgroundColor = color;

      changeColor(element, color);

      updateResult();

      resistanceFromTextInput = false;
    }
    else
    {
      document.getElementById('error_exponent').style.display = 'unset';
      document.getElementById('exponent').style.border = '1px solid red';
    }
  });

  document.getElementById('copy_result').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('text').textContent);
    document.getElementById('confirm_copy').style.display = 'unset';
  });
});
