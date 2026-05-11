describe('settings', () => {
  describe('width (without height)', () => {
    const id = 'testContainer';

    beforeEach(function() {
      this.$container = $(`<div id="${id}"></div>`).appendTo('body');
    });

    afterEach(function() {
      if (this.$container) {
        destroy();
        this.$container.remove();
      }
    });

    it('should respect width when height is not provided', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(100, 30),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
      });

      expect($(hot.rootElement).width()).toBeAroundValue(200, 1);

      const holder = hot.rootElement.querySelector('.wtHolder');

      expect(holder).toBeDefined();
      // Width should constrain the grid. When height is omitted, the table should still clip
      // horizontally so it does not visually overflow its container (the reported regression).
      expect(window.getComputedStyle(hot.rootElement).overflowX).toBe('clip');
      expect(holder.getBoundingClientRect().width).toBeAroundValue(200, 1);
    });

    it('should treat `height: undefined` the same as omitting height', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(100, 30),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
        height: undefined,
      });

      expect($(hot.rootElement).width()).toBeAroundValue(200, 1);

      const holder = hot.rootElement.querySelector('.wtHolder');

      expect(holder).toBeDefined();
      expect(window.getComputedStyle(hot.rootElement).overflowX).toBe('clip');
      expect(holder.getBoundingClientRect().width).toBeAroundValue(200, 1);
    });

    it('should not apply overflow clipping when `width` is `auto` and `height` is not provided', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        width: 'auto',
      });

      const holder = hot.rootElement.querySelector('.wtHolder');

      expect(holder).toBeDefined();
      // `width: 'auto'` fills the container naturally — no horizontal overflow to clip.
      expect(window.getComputedStyle(hot.rootElement).overflowX).not.toBe('clip');
      // The table must be visible (non-zero dimensions).
      expect(hot.rootElement.getBoundingClientRect().height).toBeGreaterThan(0);
    });

    it('should clip horizontally when `height` is reset with `null` alongside `width`', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(100, 30),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
        height: 300,
      });

      await updateSettings({
        width: 200,
        height: null,
      });

      expect($(hot.rootElement).width()).toBeAroundValue(200, 1);
      expect(window.getComputedStyle(hot.rootElement).overflowX).toBe('clip');

      const holder = hot.rootElement.querySelector('.wtHolder');

      expect(holder).toBeDefined();
      expect(holder.getBoundingClientRect().width).toBeAroundValue(200, 1);
    });

    it('should clip horizontally when `beforeHeightChange` coerces height to `null`', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(100, 30),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
        height: 300,
      });

      await updateSettings({
        width: 200,
        height: 400,
        beforeHeightChange() {
          return null;
        },
      });

      expect($(hot.rootElement).width()).toBeAroundValue(200, 1);
      expect(window.getComputedStyle(hot.rootElement).overflowX).toBe('clip');
    });

    it('should clip horizontally when height-only `updateSettings` removes height from a table with configured width', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(100, 30),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
        height: 300,
      });

      // Pass only height — width remains 200 from init.
      await updateSettings({ height: null });

      expect($(hot.rootElement).width()).toBeAroundValue(200, 1);
      expect(window.getComputedStyle(hot.rootElement).overflowX).toBe('clip');

      const holder = hot.rootElement.querySelector('.wtHolder');

      expect(holder).toBeDefined();
      expect(holder.getBoundingClientRect().width).toBeAroundValue(200, 1);
    });

    it('should clear overflow clipping when `width` changes to `auto` via `updateSettings`', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(5, 5),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
      });

      expect(window.getComputedStyle(hot.rootElement).overflowX).toBe('clip');

      await updateSettings({ width: 'auto' });

      expect(window.getComputedStyle(hot.rootElement).overflowX).not.toBe('clip');
    });

    it('should not set individual overflowX clip when width-only `updateSettings` is called on a table with configured height', async() => {
      const hot = handsontable({
        data: createSpreadsheetData(100, 30),
        rowHeaders: true,
        colHeaders: true,
        width: 200,
        height: 300,
      });

      // Only pass width — height 300 remains from init and is already clipping via overflow shorthand.
      await updateSettings({ width: 250 });

      // Inline overflowX must NOT be set as an individual property: the overflow shorthand
      // from the height block already handles horizontal clipping, and setting it individually
      // would leave a stale clip if height were later removed separately.
      expect(hot.rootElement.style.overflowX).not.toBe('clip');
    });
  });
});

