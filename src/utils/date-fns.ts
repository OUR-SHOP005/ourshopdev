

const format = (date: Date, formatString: string): string => {
    const options: Intl.DateTimeFormatOptions = {};
    
    if (formatString.includes("PPP")) {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
    } else if (formatString.includes("yyyy-MM-dd")) {
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
    }
  
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

export { format };