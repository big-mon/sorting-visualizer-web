export function* bubbleSort(order, getKey) {
  const n = order.length;
  for (let i = 0; i < n - 1; i += 1) {
    for (let j = 0; j < n - i - 1; j += 1) {
      yield { type: "cmp", i: j, j: j + 1 };
      if (getKey(order[j]) > getKey(order[j + 1])) {
        [order[j], order[j + 1]] = [order[j + 1], order[j]];
        yield { type: "swap", i: j, j: j + 1 };
      }
    }
  }
}

export function* insertionSort(order, getKey) {
  for (let i = 1; i < order.length; i += 1) {
    let j = i;
    while (j > 0) {
      yield { type: "cmp", i: j - 1, j };
      if (getKey(order[j - 1]) <= getKey(order[j])) {
        break;
      }
      [order[j - 1], order[j]] = [order[j], order[j - 1]];
      yield { type: "swap", i: j - 1, j };
      j -= 1;
    }
  }
}

export function* selectionSort(order, getKey) {
  const n = order.length;
  for (let i = 0; i < n - 1; i += 1) {
    let minIndex = i;
    for (let j = i + 1; j < n; j += 1) {
      yield { type: "cmp", i: minIndex, j };
      if (getKey(order[j]) < getKey(order[minIndex])) {
        minIndex = j;
      }
    }
    if (minIndex !== i) {
      [order[i], order[minIndex]] = [order[minIndex], order[i]];
      yield { type: "swap", i, j: minIndex };
    }
  }
}

export function* quickSort(order, getKey) {
  function* partition(lo, hi) {
    const pivot = getKey(order[hi]);
    let i = lo;
    for (let j = lo; j < hi; j += 1) {
      yield { type: "cmp", i: j, j: hi };
      if (getKey(order[j]) < pivot) {
        if (i !== j) {
          [order[i], order[j]] = [order[j], order[i]];
          yield { type: "swap", i, j };
        }
        i += 1;
      }
    }
    if (i !== hi) {
      [order[i], order[hi]] = [order[hi], order[i]];
      yield { type: "swap", i, j: hi };
    }
    return i;
  }

  function* quick(lo, hi) {
    if (lo >= hi) {
      return;
    }
    const p = yield* partition(lo, hi);
    yield* quick(lo, p - 1);
    yield* quick(p + 1, hi);
  }

  yield* quick(0, order.length - 1);
}

export function* mergeSort(order, getKey) {
  const aux = order.slice();

  function* merge(lo, mid, hi) {
    for (let k = lo; k <= hi; k += 1) {
      aux[k] = order[k];
    }
    let i = lo;
    let j = mid + 1;
    for (let k = lo; k <= hi; k += 1) {
      if (i > mid) {
        order[k] = aux[j];
        yield { type: "write", index: k, value: aux[j] };
        j += 1;
      } else if (j > hi) {
        order[k] = aux[i];
        yield { type: "write", index: k, value: aux[i] };
        i += 1;
      } else {
        yield { type: "cmp", i, j };
        if (getKey(aux[i]) <= getKey(aux[j])) {
          order[k] = aux[i];
          yield { type: "write", index: k, value: aux[i] };
          i += 1;
        } else {
          order[k] = aux[j];
          yield { type: "write", index: k, value: aux[j] };
          j += 1;
        }
      }
    }
  }

  function* split(lo, hi) {
    if (lo >= hi) {
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    yield* split(lo, mid);
    yield* split(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }

  yield* split(0, order.length - 1);
}

export function* heapSort(order, getKey) {
  const n = order.length;

  function* heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < size) {
      yield { type: "cmp", i: left, j: largest };
      if (getKey(order[left]) > getKey(order[largest])) {
        largest = left;
      }
    }
    if (right < size) {
      yield { type: "cmp", i: right, j: largest };
      if (getKey(order[right]) > getKey(order[largest])) {
        largest = right;
      }
    }
    if (largest !== root) {
      [order[root], order[largest]] = [order[largest], order[root]];
      yield { type: "swap", i: root, j: largest };
      yield* heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    yield* heapify(n, i);
  }

  for (let i = n - 1; i > 0; i -= 1) {
    [order[0], order[i]] = [order[i], order[0]];
    yield { type: "swap", i: 0, j: i };
    yield* heapify(i, 0);
  }
}

export function* shellSort(order, getKey) {
  const n = order.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i += 1) {
      let j = i;
      while (j >= gap) {
        yield { type: "cmp", i: j - gap, j };
        if (getKey(order[j - gap]) <= getKey(order[j])) {
          break;
        }
        [order[j - gap], order[j]] = [order[j], order[j - gap]];
        yield { type: "swap", i: j - gap, j };
        j -= gap;
      }
    }
  }
}

export function* combSort(order, getKey) {
  const n = order.length;
  const shrink = 1.3;
  let gap = n;
  let swapped = true;
  while (gap > 1 || swapped) {
    gap = Math.floor(gap / shrink);
    if (gap < 1) {
      gap = 1;
    }
    swapped = false;
    for (let i = 0; i + gap < n; i += 1) {
      yield { type: "cmp", i, j: i + gap };
      if (getKey(order[i]) > getKey(order[i + gap])) {
        [order[i], order[i + gap]] = [order[i + gap], order[i]];
        yield { type: "swap", i, j: i + gap };
        swapped = true;
      }
    }
  }
}

export function* cocktailSort(order, getKey) {
  const n = order.length;
  let start = 0;
  let end = n - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i += 1) {
      yield { type: "cmp", i, j: i + 1 };
      if (getKey(order[i]) > getKey(order[i + 1])) {
        [order[i], order[i + 1]] = [order[i + 1], order[i]];
        yield { type: "swap", i, j: i + 1 };
        swapped = true;
      }
    }
    if (!swapped) {
      break;
    }
    swapped = false;
    end -= 1;
    for (let i = end; i > start; i -= 1) {
      yield { type: "cmp", i: i - 1, j: i };
      if (getKey(order[i - 1]) > getKey(order[i])) {
        [order[i - 1], order[i]] = [order[i], order[i - 1]];
        yield { type: "swap", i: i - 1, j: i };
        swapped = true;
      }
    }
    start += 1;
  }
}

export function* gnomeSort(order, getKey) {
  const n = order.length;
  let i = 1;
  while (i < n) {
    yield { type: "cmp", i: i - 1, j: i };
    if (getKey(order[i - 1]) <= getKey(order[i])) {
      i += 1;
    } else {
      [order[i - 1], order[i]] = [order[i], order[i - 1]];
      yield { type: "swap", i: i - 1, j: i };
      if (i > 1) {
        i -= 1;
      } else {
        i = 1;
      }
    }
  }
}

export function* oddEvenSort(order, getKey) {
  const n = order.length;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 1; i < n - 1; i += 2) {
      yield { type: "cmp", i, j: i + 1 };
      if (getKey(order[i]) > getKey(order[i + 1])) {
        [order[i], order[i + 1]] = [order[i + 1], order[i]];
        yield { type: "swap", i, j: i + 1 };
        swapped = true;
      }
    }
    for (let i = 0; i < n - 1; i += 2) {
      yield { type: "cmp", i, j: i + 1 };
      if (getKey(order[i]) > getKey(order[i + 1])) {
        [order[i], order[i + 1]] = [order[i + 1], order[i]];
        yield { type: "swap", i, j: i + 1 };
        swapped = true;
      }
    }
  }
}

export function* bitonicSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  const isPowerOfTwo = (n & (n - 1)) === 0;
  if (!isPowerOfTwo) {
    yield* mergeSort(order, getKey);
    return;
  }
  for (let k = 2; k <= n; k <<= 1) {
    for (let j = k >> 1; j > 0; j >>= 1) {
      for (let i = 0; i < n; i += 1) {
        const ix = i ^ j;
        if (ix > i) {
          yield { type: "cmp", i, j: ix };
          const ascending = (i & k) === 0;
          const shouldSwap = ascending
            ? getKey(order[i]) > getKey(order[ix])
            : getKey(order[i]) < getKey(order[ix]);
          if (shouldSwap) {
            [order[i], order[ix]] = [order[ix], order[i]];
            yield { type: "swap", i, j: ix };
          }
        }
      }
    }
  }
}

export function* oddEvenMergeSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  const isPowerOfTwo = (n & (n - 1)) === 0;
  if (!isPowerOfTwo) {
    yield* mergeSort(order, getKey);
    return;
  }

  function* compareSwap(i, j) {
    yield { type: "cmp", i, j };
    if (getKey(order[i]) > getKey(order[j])) {
      [order[i], order[j]] = [order[j], order[i]];
      yield { type: "swap", i, j };
    }
  }

  function* oddEvenMerge(lo, size, step) {
    const next = step * 2;
    if (next < size) {
      yield* oddEvenMerge(lo, size, next);
      yield* oddEvenMerge(lo + step, size, next);
      for (let i = lo + step; i + step < lo + size; i += next) {
        yield* compareSwap(i, i + step);
      }
    } else {
      yield* compareSwap(lo, lo + step);
    }
  }

  function* sortRange(lo, size) {
    if (size > 1) {
      const mid = Math.floor(size / 2);
      yield* sortRange(lo, mid);
      yield* sortRange(lo + mid, mid);
      yield* oddEvenMerge(lo, size, 1);
    }
  }

  yield* sortRange(0, n);
}

export function* timSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  const run = 32;
  const aux = order.slice();

  function* insertionRange(lo, hi) {
    for (let i = lo + 1; i <= hi; i += 1) {
      let j = i;
      while (j > lo) {
        yield { type: "cmp", i: j - 1, j };
        if (getKey(order[j - 1]) <= getKey(order[j])) {
          break;
        }
        [order[j - 1], order[j]] = [order[j], order[j - 1]];
        yield { type: "swap", i: j - 1, j };
        j -= 1;
      }
    }
  }

  function* merge(lo, mid, hi) {
    for (let k = lo; k <= hi; k += 1) {
      aux[k] = order[k];
    }
    let i = lo;
    let j = mid + 1;
    for (let k = lo; k <= hi; k += 1) {
      if (i > mid) {
        order[k] = aux[j];
        yield { type: "write", index: k, value: aux[j] };
        j += 1;
      } else if (j > hi) {
        order[k] = aux[i];
        yield { type: "write", index: k, value: aux[i] };
        i += 1;
      } else {
        yield { type: "cmp", i, j };
        if (getKey(aux[i]) <= getKey(aux[j])) {
          order[k] = aux[i];
          yield { type: "write", index: k, value: aux[i] };
          i += 1;
        } else {
          order[k] = aux[j];
          yield { type: "write", index: k, value: aux[j] };
          j += 1;
        }
      }
    }
  }

  for (let i = 0; i < n; i += run) {
    yield* insertionRange(i, Math.min(i + run - 1, n - 1));
  }

  for (let size = run; size < n; size *= 2) {
    for (let lo = 0; lo < n; lo += 2 * size) {
      const mid = Math.min(lo + size - 1, n - 1);
      const hi = Math.min(lo + 2 * size - 1, n - 1);
      if (mid < hi) {
        yield* merge(lo, mid, hi);
      }
    }
  }
}

export function* introSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  const maxDepth = Math.floor(Math.log2(n)) * 2;

  function* insertionRange(lo, hi) {
    for (let i = lo + 1; i <= hi; i += 1) {
      let j = i;
      while (j > lo) {
        yield { type: "cmp", i: j - 1, j };
        if (getKey(order[j - 1]) <= getKey(order[j])) {
          break;
        }
        [order[j - 1], order[j]] = [order[j], order[j - 1]];
        yield { type: "swap", i: j - 1, j };
        j -= 1;
      }
    }
  }

  function* heapifyRange(size, root, offset) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size) {
      yield { type: "cmp", i: offset + left, j: offset + largest };
      if (getKey(order[offset + left]) > getKey(order[offset + largest])) {
        largest = left;
      }
    }
    if (right < size) {
      yield { type: "cmp", i: offset + right, j: offset + largest };
      if (getKey(order[offset + right]) > getKey(order[offset + largest])) {
        largest = right;
      }
    }
    if (largest !== root) {
      [order[offset + root], order[offset + largest]] = [
        order[offset + largest],
        order[offset + root],
      ];
      yield { type: "swap", i: offset + root, j: offset + largest };
      yield* heapifyRange(size, largest, offset);
    }
  }

  function* heapSortRange(lo, hi) {
    const size = hi - lo + 1;
    for (let i = Math.floor(size / 2) - 1; i >= 0; i -= 1) {
      yield* heapifyRange(size, i, lo);
    }
    for (let i = size - 1; i > 0; i -= 1) {
      [order[lo], order[lo + i]] = [order[lo + i], order[lo]];
      yield { type: "swap", i: lo, j: lo + i };
      yield* heapifyRange(i, 0, lo);
    }
  }

  function* partition(lo, hi) {
    const pivot = getKey(order[hi]);
    let i = lo;
    for (let j = lo; j < hi; j += 1) {
      yield { type: "cmp", i: j, j: hi };
      if (getKey(order[j]) < pivot) {
        if (i !== j) {
          [order[i], order[j]] = [order[j], order[i]];
          yield { type: "swap", i, j };
        }
        i += 1;
      }
    }
    if (i !== hi) {
      [order[i], order[hi]] = [order[hi], order[i]];
      yield { type: "swap", i, j: hi };
    }
    return i;
  }

  function* intro(lo, hi, depth) {
    if (lo >= hi) {
      return;
    }
    const size = hi - lo + 1;
    if (size <= 16) {
      yield* insertionRange(lo, hi);
      return;
    }
    if (depth === 0) {
      yield* heapSortRange(lo, hi);
      return;
    }
    const p = yield* partition(lo, hi);
    yield* intro(lo, p - 1, depth - 1);
    yield* intro(p + 1, hi, depth - 1);
  }

  yield* intro(0, n - 1, maxDepth);
}

export function* countingSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  let minKey = getKey(order[0]);
  let maxKey = minKey;
  for (let i = 1; i < n; i += 1) {
    const key = getKey(order[i]);
    if (key < minKey) {
      minKey = key;
    }
    if (key > maxKey) {
      maxKey = key;
    }
  }
  const range = maxKey - minKey + 1;
  const counts = new Array(range).fill(0);
  for (let i = 0; i < n; i += 1) {
    counts[getKey(order[i]) - minKey] += 1;
  }
  for (let i = 1; i < range; i += 1) {
    counts[i] += counts[i - 1];
  }
  const output = new Array(n);
  for (let i = n - 1; i >= 0; i -= 1) {
    const key = getKey(order[i]) - minKey;
    counts[key] -= 1;
    output[counts[key]] = order[i];
  }
  for (let i = 0; i < n; i += 1) {
    order[i] = output[i];
    yield { type: "write", index: i, value: output[i] };
  }
}

export function* radixSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  let maxKey = getKey(order[0]);
  for (let i = 1; i < n; i += 1) {
    const key = getKey(order[i]);
    if (key > maxKey) {
      maxKey = key;
    }
  }
  const output = new Array(n);
  for (let exp = 1; Math.floor(maxKey / exp) > 0; exp *= 10) {
    const counts = new Array(10).fill(0);
    for (let i = 0; i < n; i += 1) {
      const digit = Math.floor(getKey(order[i]) / exp) % 10;
      counts[digit] += 1;
    }
    for (let i = 1; i < 10; i += 1) {
      counts[i] += counts[i - 1];
    }
    for (let i = n - 1; i >= 0; i -= 1) {
      const digit = Math.floor(getKey(order[i]) / exp) % 10;
      counts[digit] -= 1;
      output[counts[digit]] = order[i];
    }
    for (let i = 0; i < n; i += 1) {
      order[i] = output[i];
      yield { type: "write", index: i, value: output[i] };
    }
  }
}

export function* bucketSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  let minKey = getKey(order[0]);
  let maxKey = minKey;
  for (let i = 1; i < n; i += 1) {
    const key = getKey(order[i]);
    if (key < minKey) {
      minKey = key;
    }
    if (key > maxKey) {
      maxKey = key;
    }
  }
  const range = maxKey - minKey + 1;
  const bucketCount = Math.max(1, Math.floor(Math.sqrt(n)));
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (let i = 0; i < n; i += 1) {
    const key = getKey(order[i]) - minKey;
    const index = Math.min(bucketCount - 1, Math.floor((key / range) * bucketCount));
    buckets[index].push(order[i]);
  }

  function insertionSortBucket(bucket) {
    for (let i = 1; i < bucket.length; i += 1) {
      const value = bucket[i];
      let j = i - 1;
      while (j >= 0 && getKey(bucket[j]) > getKey(value)) {
        bucket[j + 1] = bucket[j];
        j -= 1;
      }
      bucket[j + 1] = value;
    }
  }

  const output = [];
  buckets.forEach((bucket) => {
    insertionSortBucket(bucket);
    bucket.forEach((value) => output.push(value));
  });
  for (let i = 0; i < n; i += 1) {
    order[i] = output[i];
    yield { type: "write", index: i, value: output[i] };
  }
}

export function* bogoSort(order, getKey) {
  const n = order.length;
  if (n <= 1) {
    return;
  }
  const maxTries = Math.min(5000, 50 * n * n);
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    let sorted = true;
    for (let i = 1; i < n; i += 1) {
      yield { type: "cmp", i: i - 1, j: i };
      if (getKey(order[i - 1]) > getKey(order[i])) {
        sorted = false;
        break;
      }
    }
    if (sorted) {
      return;
    }
    for (let i = n - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i !== j) {
        [order[i], order[j]] = [order[j], order[i]];
        yield { type: "swap", i, j };
      }
    }
  }
  yield* insertionSort(order, getKey);
}

export const algorithms = {
  bubble: { name: "Bubble", generator: bubbleSort },
  insertion: { name: "Insertion", generator: insertionSort },
  selection: { name: "Selection", generator: selectionSort },
  quick: { name: "Quick", generator: quickSort },
  merge: { name: "Merge", generator: mergeSort },
  heap: { name: "Heap", generator: heapSort },
  shell: { name: "Shell", generator: shellSort },
  intro: { name: "Intro", generator: introSort },
  tim: { name: "Tim", generator: timSort },
  comb: { name: "Comb", generator: combSort },
  cocktail: { name: "Cocktail", generator: cocktailSort },
  gnome: { name: "Gnome", generator: gnomeSort },
  oddEven: { name: "Odd-even", generator: oddEvenSort },
  bitonic: { name: "Bitonic", generator: bitonicSort },
  oddEvenMerge: { name: "Odd-even merge", generator: oddEvenMergeSort },
  counting: { name: "Counting", generator: countingSort },
  radix: { name: "Radix", generator: radixSort },
  bucket: { name: "Bucket", generator: bucketSort },
  bogo: { name: "Bogo", generator: bogoSort },
};
