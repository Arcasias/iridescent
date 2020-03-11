class TestSuite {
    constructor(config = {}) {
        const defaultConfig = {
            timeout: 100,
        };
        this.tests = [];
        this.config = Object.assign(config, defaultConfig, config);
        this.currentSection = "";

        this.assertions = 0;
    }

    add(name, test) {
        this.tests.push({ name, test, section: this.currentSection, skip: false });
    }

    assert(value) {
        this.assertions++;
        if (!value) {
            throw new Error(`Assertion failed.`);
        }
    }

    async run() {
        this.assertions = 0;
        await new Promise(setTimeout);
        const globalTime = Date.now();
        console.log(`Starting new Test suite with config`, this.config);
        const colors = Color.rainbow(this.tests.length);
        let failed = 0, skipped = 0, tested = 0;
        for (let i = 0; i < this.tests.length; i++) {
            const { name, test, section, skip } = this.tests[i];
            if (skip) {
                skipped++;
                return console.warn(`%cSkip: ${section} / ${name}.`, colors[i].css);
            }
            tested++;
            const failTimeout = setTimeout(() => {
                throw new Error(`Timeout exceeded: ${this.config.timeout} milliseconds.`);
            }, this.config.timeout);
            try {
                await test(this.assert.bind(this));
                console.log(`%c${section} / ${name}`, colors[i].css);
            } catch (err) {
                failed++;
                console.error(`%cFailed: ${section} / ${name}`, colors[i].css, err);
            } finally {
                clearTimeout(failTimeout);
            }
        }
        console.log(
            `All tests finished in ${Date.now() - globalTime} milliseconds. (${this.assertions} assertions in ${tested} tests. ${failed} failed. ${skipped} skipped).`,
        );
    }

    section(section) {
        this.currentSection = section;
    }

    skip(name, test) {
        this.tests.push({ name, test, section: this.currentSection, skip: true });
    }
}

const tests = new TestSuite();

tests.section("Constructor");

tests.add("Standard", async function (assert) {
    const color = new Color(255, 0, 128);
    assert(color.compare(255, 0, 128));
});
tests.add("Array", async function (assert) {
    const color = new Color([255, 0, 128]);
    assert(color.compare(255, 0, 128));
});
tests.add("Object", async function (assert) {
    const color = new Color({ r: 255, g: 0, b: 128 });
    assert(color.compare(255, 0, 128));
});
tests.add("JSON", async function (assert) {
    const color = new Color('{ "r": 255, "g": 0, "b": 128 }');
    assert(color.compare(255, 0, 128));
});
tests.add("Color", async function (assert) {
    const color = new Color(new Color(255, 0, 128));
    assert(color.compare(255, 0, 128));
});
tests.add("Long hex", async function (assert) {
    const color = new Color('#fF0080');
    assert(color.compare(255, 0, 128));
});
tests.add("Short hex", async function (assert) {
    const color = new Color('#f08');
    assert(color.compare(255, 0, 136));
});
tests.add("RGB", async function (assert) {
    const color = new Color('rgb(255, 0, 128)');
    assert(color.compare(255, 0, 128));
});
tests.add("RGBA", async function (assert) {
    const color = new Color('rgba(255, 0, 128, 1)');
    assert(color.compare(255, 0, 128));
});
tests.add("HTML", async function (assert) {
    const color = new Color('magenta');
    assert(color.compare(255, 0, 255));
});

tests.section("Methods");

tests.add("Compare", async function (assert) {
    const a = new Color(255, 0, 0);
    const b = new Color(255, 0, 0);
    const c = new Color(0, 128, 255);
    assert(a.compare(b));
    assert(!a.compare(c));
    assert(b.compare(a));
    assert(!b.compare(c));
    assert(!c.compare(a));
    assert(!c.compare(b));

    assert(a.r === b.r);
    assert(a.g === b.g);
    assert(a.b === b.b);

    assert(a.r !== c.r);
    assert(a.g !== c.g);
    assert(a.b !== c.b);
});

tests.add("Mix", async function (assert) {
    const a = new Color(255, 0, 0);
    const b = new Color(0, 0, 255);
    const mix = a.mix(b);
    assert(mix.compare(127, 0, 127));
});

tests.section("Static");

tests.add("Range", async function (assert) {
    const a = new Color(255, 0, 0);
    const b = new Color(0, 0, 255);
    const range = a.range(b, 3);
    assert(range.length === 3);
    assert(range[0].compare(a));
    assert(range[1].compare(127, 0, 127));
    assert(range[2].compare(b));
});
tests.add("Rainbow: 3 colors", async function (assert) {
    const rainbow = Color.rainbow(3);
    assert(rainbow.length === 3);
    assert(rainbow[0].compare(255, 0, 0));
    assert(rainbow[1].compare(0, 255, 0));
    assert(rainbow[2].compare(0, 0, 255));
});
tests.add("Rainbow: 6 colors", async function (assert) {
    const rainbow = Color.rainbow(6);
    assert(rainbow.length === 6);
    assert(rainbow[0].compare(255, 0, 0));
    assert(rainbow[1].compare(255, 255, 0));
    assert(rainbow[2].compare(0, 255, 0));
    assert(rainbow[3].compare(0, 255, 255));
    assert(rainbow[4].compare(0, 0, 255));
    assert(rainbow[5].compare(255, 0, 255));
});

tests.run();
