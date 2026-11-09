package practice;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.Objects;

/** Small documented operations for writing tests from contracts. */
public final class TrainingApi {
    private TrainingApi() { }

    /** Returns true exactly when value is between 1 and 100, inclusive. */
    public static boolean inRange(int value) {
        return value >= 1 && value <= 100;
    }

    /** Returns 0 for null; otherwise returns text.length(). Does not modify text. */
    public static int lengthOrZero(String text) {
        return text == null ? 0 : text.length();
    }

    /**
     * Returns value constrained to the inclusive interval [min, max].
     * @throws IllegalArgumentException if min > max, with message "min exceeds max"
     */
    public static int clamp(int value, int min, int max) {
        if (min > max) throw new IllegalArgumentException("min exceeds max");
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    /**
     * Returns a separate array with the same elements in the same order.
     * Modifying either array later must not change the other.
     * @throws NullPointerException if values is null
     */
    public static int[] copy(int[] values) {
        Objects.requireNonNull(values, "values");
        return values.clone();
    }

    /**
     * Returns the number of elements greater than zero. Empty arrays return 0.
     * @throws NullPointerException if values is null
     */
    public static int countPositive(int[] values) {
        Objects.requireNonNull(values, "values");
        int count = 0;
        for (int value : values) if (value > 0) count++;
        return count;
    }

    /** Returns true exactly for a non-null, nonempty name with count > 0. */
    public static boolean canShip(String name, int count) {
        if (name != null && !name.isEmpty() && count > 0) return true;
        return false;
    }

    /**
     * Returns a + b as a BigInteger. Neither input is modified.
     * @throws NullPointerException if a or b is null
     */
    public static BigInteger add(BigInteger a, BigInteger b) {
        Objects.requireNonNull(a, "a");
        Objects.requireNonNull(b, "b");
        return a.add(b);
    }

    /** A mutable nonnegative count. set replaces the previous value. */
    public static final class Counter {
        private int value;
        /** Starts at 0. */
        public Counter() { }
        public int get() { return value; }
        /** Returns true exactly when the stored count is zero. */
        public boolean isZero() { return value == 0; }
        /**
         * Checks the value without changing any Counter.
         * @throws IllegalArgumentException if next < 0, with message "value must be nonnegative"
         */
        public static void requireNonnegative(int next) {
            if (next < 0) throw new IllegalArgumentException("value must be nonnegative");
        }
        /**
         * Replaces the stored value.
         * @throws IllegalArgumentException if next < 0, with message "value must be nonnegative";
         * state remains unchanged
         */
        public void set(int next) {
            requireNonnegative(next);
            value = next;
        }
        /**
         * Increases the count by one.
         * @throws ArithmeticException if incrementing would overflow int; state unchanged
         */
        public void increment() { value = Math.addExact(value, 1); }
    }

    /** A fixed-capacity stack of Strings. Last pushed is first popped. */
    public static final class TinyStack {
        private final String[] values;
        private int size;
        /** @throws IllegalArgumentException if capacity < 1 */
        public TinyStack(int capacity) {
            if (capacity < 1) throw new IllegalArgumentException("capacity must be positive");
            values = new String[capacity];
        }
        public int size() { return size; }
        public boolean isEmpty() { return size == 0; }
        /**
         * Stores the exact reference. Checks null before capacity.
         * @throws NullPointerException if value is null
         * @throws IllegalStateException if already full
         * Either error leaves the stack unchanged.
         */
        public void push(String value) {
            Objects.requireNonNull(value, "value");
            if (size == values.length) throw new IllegalStateException("stack is full");
            values[size++] = value;
        }
        /**
         * Removes and returns the most recently pushed reference.
         * @throws NoSuchElementException if empty; state remains unchanged
         */
        public String pop() {
            if (size == 0) throw new NoSuchElementException("stack is empty");
            String result = values[--size];
            values[size] = null;
            return result;
        }
        /** Returns an independent array in oldest-to-newest order. */
        public String[] snapshot() { return Arrays.copyOf(values, size); }
    }
}
