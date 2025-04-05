export function MESAVEUTILS<T>(key: string, data: T): void {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1); // Set expiry to 1 day from now

    const valueToStore = {
      expiryDate: expiryDate.toISOString(),
      data: data,
    };

    localStorage.setItem(key, JSON.stringify(valueToStore));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
}

export function MERETRIVEUTIL<T>(key: string): T | null {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) {
      return null; // Key not present
    }

    const { expiryDate, data } = JSON.parse(storedValue);
    const now = new Date();

    if (new Date(expiryDate) < now) {
      localStorage.removeItem(key); // Remove expired item
      return null; // Expiry date reached
    }

    return data as T; // Return the stored data
  } catch (error) {
    console.error("Error retrieving from local storage:", error);
    return null; // Return null in case of error
  }
}
