package practice;

import java.util.Objects;

/** Intentionally faulty practice code. Treat the comments as the required behaviour. */
public final class BrokenUtilities {
    private BrokenUtilities() { }

    /** Returns how many values are positive; empty returns 0; null throws NPE. */
    public static int countPositive(int[] values) {
        Objects.requireNonNull(values, "values");
        int count = 0;
        for (int i = 0; i < values.length - 1; i++) {
            if (values[i] > 0) count++;
        }
        return count;
    }

    /**
     * Returns true if any non-null element has the same text as target.
     * A null target returns false. A null array throws NullPointerException.
     */
    public static boolean contains(String[] names, String target) {
        Objects.requireNonNull(names, "names");
        if (target == null) return false;
        for (String name : names) if (name == target) return true;
        return false;
    }

    /** Returns true for ages 65 and above. Negative ages return false. */
    public static boolean hasDiscount(int age) { return age > 65; }

    /** Returns true exactly when name is non-null and not empty. */
    public static boolean validName(String name) {
        return !name.isEmpty() && name != null;
    }

    /** Stores a nonnegative count. */
    public static final class Counter {
        private int count;
        public int get() { return count; }
        /** Replaces the old count; negative input throws IAE and leaves state unchanged. */
        public void set(int value) {
            if (value < 0) throw new IllegalArgumentException("negative count");
            count += value;
        }
    }

    /** A simple one-slot buffer: put replaces its item, take removes and returns it. */
    public static final class Buffer {
        private String item;
        private int size;
        public int size() { return size; }
        /** Null throws NPE without changing state. Otherwise stores exactly this reference. */
        public void put(String value) {
            item = Objects.requireNonNull(value, "value");
            size = 1;
        }
        /** Returns null if empty; otherwise removes and returns the stored reference. */
        public String take() {
            String result = item;
            item = null;
            return result;
        }
    }
}
