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

export const algorithms = {
  bubble: { name: "Bubble", generator: bubbleSort },
  insertion: { name: "Insertion", generator: insertionSort },
  selection: { name: "Selection", generator: selectionSort },
  quick: { name: "Quick", generator: quickSort },
  merge: { name: "Merge", generator: mergeSort },
  heap: { name: "Heap", generator: heapSort },
};
