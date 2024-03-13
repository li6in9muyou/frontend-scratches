function Ifs(
  list,
  getItem,
  options = { maxLen: 10, initLen: 6, preload: 3, getLoading: null },
) {
  this.MAX_ITEM_COUNT = options?.maxLen ?? 10;
  this.INIT_ITEM_COUNT = options?.initLen ?? 6;
  this.PRELOAD_ITEM_COUNT = options?.preload ?? 3;
  this.$list = $(list);
  this.getItem = getItem;
  this.keyFront = 0;
  this.keyBack = NaN;
  this.obFront = new IntersectionObserver(
    (entries) => {
      console.assert(
        entries.length === 1,
        "multiple observation targets in this.obFront",
      );
      const front = entries[0];
      console.log(
        "this.obFront:" + $(front.target).attr("data-ifs-key"),
        front.intersectionRatio,
      );
      if (front.intersectionRatio > 0.75) {
        this.addFrontManyItems(this.PRELOAD_ITEM_COUNT);
      }
    },
    {
      root: this.$list[0] ?? this.$list,
      rootMargin: "0px",
      threshold: [0.75],
    },
  );
  this.obBack = new IntersectionObserver(
    (entries) => {
      console.assert(
        entries.length === 1,
        "multiple observation targets in this.obBack",
      );
      const back = entries[0];
      console.log(
        "this.obBack:" + $(back.target).attr("data-ifs-key"),
        back.intersectionRatio,
      );
      if (back.intersectionRatio > 0.75) {
        this.addBackManyItems(this.PRELOAD_ITEM_COUNT);
      }
    },
    {
      root: this.$list[0] ?? this.$list,
      rootMargin: "0px",
      threshold: [0.75],
    },
  );
  this.getExcessiveItemCnt = () =>
    this.keyBack - this.keyFront - this.MAX_ITEM_COUNT + 1;

  this.__helperRemoveManyItems = (cnt, getNextKey) => {
    this.$list.children("[data-ifs-key]").each((_, item) => {
      this.obFront.unobserve(item);
      this.obBack.unobserve(item);
    });
    for (let i = 0; i < cnt; i++) {
      const key = getNextKey();
      this.$list.children(`[data-ifs-key='${key}']`).remove();
    }
    const items = this.$list.children("[data-ifs-key]");
    this.obFront.observe(items.eq(0)[0]);
    this.obBack.observe(items.eq(-1)[0]);
  };

  this.__helperAddManyItems = (cnt, getBatchKeys, handleEvent) => {
    const batchKeys = getBatchKeys(cnt);
    let successCnt = 0;
    for (const key of batchKeys) {
      // todo: what if getItem throws or fails
      const item = this.getItem(key);
      console.assert(
        !!item,
        `infinite-scroll: invalid item !!item = false, key = ${key}`,
      );

      if (item !== NoItem) {
        const $item = $(item);
        $item.attr("data-ifs-key", key);
        handleEvent("success", $item, key);
        successCnt += 1;
      } else {
        handleEvent("no-item", null, key);
      }
    }

    if (successCnt === 0) {
      return;
    }

    const items = this.$list.children("[data-ifs-key]");
    items.each((_, item) => {
      this.obFront.unobserve(item);
      this.obBack.unobserve(item);
    });
    if (items.length > 0) {
      this.obFront.observe(items.eq(0)[0]);
      this.obBack.observe(items.eq(-1)[0]);
    }

    return {};
  };

  this.addFrontManyItems = (cnt = this.PRELOAD_ITEM_COUNT) => {
    this.__helperAddManyItems(
      cnt,
      (cnt) => {
        const ans = [];
        const start = this.keyFront - 1;
        for (let i = 0; i < cnt; i++) {
          ans.push(start - i);
        }
        return ans;
      },
      (event, ...args) => {
        console.log("addFront event, args", event, args);
        switch (event) {
          case "success":
            const [$listItem, key] = args;
            this.$list.prepend($listItem);
            this.keyFront = key;
            this.__helperRemoveManyItems(
              this.getExcessiveItemCnt(),
              () => this.keyBack--,
            );
            break;
          default:
            console.warn("addFrontManyItems: unexpected event", event, args);
            break;
        }
      },
    );
  };

  this.addBackManyItems = (cnt = this.PRELOAD_ITEM_COUNT) => {
    this.__helperAddManyItems(
      cnt,
      (cnt) => {
        const start = Number.isNaN(this.keyBack) ? 0 : this.keyBack + 1;

        const ans = [];
        ans.push(start);
        for (let i = 0; i < cnt; i++) {
          ans.push(start + i);
        }
        return ans;
      },
      (event, ...args) => {
        console.log("addBack event, args", event, args);
        switch (event) {
          case "success":
            const [$listItem, key] = args;
            this.$list.append($listItem);
            this.keyBack = key;
            this.__helperRemoveManyItems(
              this.getExcessiveItemCnt(),
              () => this.keyFront++,
            );
            break;
          default:
            console.warn("addBackManyItems: unexpected event", event, args);
            break;
        }
      },
    );
  };

  this.addBackManyItems(this.INIT_ITEM_COUNT);
}

export default function addInfiniteScrollEffect(list, getItem, options) {
  return new Ifs(list, getItem, options);
}

export const NoItem = 112233445566;
