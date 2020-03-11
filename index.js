const colorsContainer = document.getElementById('colors');
const { Color } = iridescent;

function setColors(...colors) {
    colorsContainer.innerHTML = '';
    colors.forEach(color => {
        const div = Object.assign(document.createElement('div'), {
            className: 'color',
            style: `width: ${100/colors.length}%; background-color: ${color.hex};`,
        });
        colorsContainer.appendChild(div);
    });
    return colors;
}

setColors(...Color.rainbow(6));
