export class NaiveBayes {

  /**
   * Initializes a NaiveBayes instance from a JSON state representation.
   * Use this with classifier.toJson().
   *
   * @param  {String} modelString   state representation obtained toJson() methods
   * @return {NaiveBayes}       Classifier
   */
  public static fromJson(modelString: string): NaiveBayes {
    try {
      const parsed = JSON.parse(modelString);
      const classifier = new NaiveBayes(parsed.options);

      Object.keys(parsed).forEach(key => {
        if (parsed[key] === undefined || parsed[key] === null) {
          throw new Error('NaiveBayes.fromJson: JSON string is missing an expected property: `' + key + '`.');
        }
        (classifier as any)[key] = parsed[key];

      });
      return classifier;

    } catch (e) {
      throw new Error('NaiveBayes.fromJson expects a valid JSON string.');
    }
  }


  public tokenizer: (text: string) => string[];
  public vocabulary: { [key: string]: boolean };
  public vocabularySize: number;
  public totalDocuments: number;
  public docCount: { [key: string]: number };
  public wordCount: { [key: string]: number };
  public wordFrequencyCount: { [key: string]: { [key: string]: number } };
  public categories: { [key: string]: boolean };


  /**
   * Naive-Bayes Classifier
   *
   * This is a naive-bayes classifier that uses Laplace Smoothing.
   *
   * Takes an (optional) options object containing:
   *   - `tokenizer`  => custom tokenization function
   *
   */
  constructor(public options: { tokenizer?: (text: string) => string[]; } = {}) {

    // set options object
    if (this.options) {
      if (!this.options || typeof this.options !== 'object' || Array.isArray(this.options)) {
        throw TypeError('NaiveBayes got invalid `options`: `' + this.options + '`. Pass in an object.');
      }
    }

    this.tokenizer = this.options.tokenizer || this.defaultTokenizer;

    // Initialize our vocabulary and its size
    this.vocabulary = {};
    this.vocabularySize = 0;

    // Number of documents we have learned from
    this.totalDocuments = 0;

    // Document frequency table for each of our categories
    // => for each category, how often were documents mapped to it
    this.docCount = {};

    // For each category, how many words total were mapped to it
    this.wordCount = {};

    // Word frequency table for each category
    // => for each category, how frequent was a given word mapped to it
    this.wordFrequencyCount = {};

    // Hashmap of our category names
    this.categories = {};
  }

  private defaultTokenizer(text: string): string[] {
    // Remove punctuation from text - remove anything that isn't a word char or a space
    return text.replace(/[^(a-zA-ZA-Яa-я0-9_)+\s]/g, ' ').split(/\s+/);
  }

  /**
   * Initialize each of our data structure entries for this new category
   *
   * @param  {String} categoryName
   */
  private initializeCategory(categoryName: string): void {
    if (!this.categories[categoryName]) {
      this.docCount[categoryName] = 0;
      this.wordCount[categoryName] = 0;
      this.wordFrequencyCount[categoryName] = {};
      this.categories[categoryName] = true;
    }
  }

  /**
   * train our naive-bayes classifier by telling it what `category`
   * the `text` corresponds to.
   *
   * @param text
   * @param category
   */
  public learn(text: string, category: string): void {

    // Initialize category data structures if we've never seen this category
    this.initializeCategory(category);

    // Update our count of how many documents mapped to this category
    this.docCount[category]++;

    // Update the total number of documents we have learned from
    this.totalDocuments++;

    // Normalize the text into a word array
    const tokens = this.tokenizer(text);

    // Get a frequency count for each token in the text
    const frequencyTable = this.frequencyTable(tokens);

    // Update our vocabulary and our word frequency count for this category
    Object.keys(frequencyTable).forEach((token: string) => {

      // Add this word to our vocabulary if not already existing
      if (!this.vocabulary[token]) {
        this.vocabulary[token] = true;
        this.vocabularySize++;
      }

      const frequencyInText = frequencyTable[token];

      // Update the frequency information for this word in this category
      if (!this.wordFrequencyCount[category][token])
        this.wordFrequencyCount[category][token] = frequencyInText;
      else
        this.wordFrequencyCount[category][token] += frequencyInText;

      // Update the count of all words we have seen mapped to this category
      this.wordCount[category] += frequencyInText;
    });
  }


  /**
   * Determine what category `text` belongs to.
   *
   * @param  {String} text
   * @return {Promise<string>} category
   */
  public categorize(text: string): string | null {
    let maxProbability = -Infinity;
    let chosenCategory: string | null = null;

    const tokens: string[] = this.tokenizer(text);
    const frequencyTable = this.frequencyTable(tokens);

    // Iterate thru our categories to find the one with max probability for this text
    Object.keys(this.categories).forEach(category => {
      // Start by calculating the overall probability of this category
      // =>  out of all documents we've ever looked at, how many were
      //    mapped to this category
      const categoryProbability = this.docCount[category] / this.totalDocuments;

      // Take the log to avoid underflow
      let logProbability = Math.log(categoryProbability);

      // Now determine P( w | c ) for each word `w` in the text
      Object
        .keys(frequencyTable)
        .forEach(token => {
          const frequencyInText = frequencyTable[token];
          const tokenProbability = this.tokenProbability(token, category);

          // console.log('token: %s category: `%s` tokenProbability: %d', token, category, tokenProbability)
          // Determine the log of the P( w | c ) for this word
          logProbability += frequencyInText * Math.log(tokenProbability);
        });

      if (logProbability > maxProbability) {
        maxProbability = logProbability;
        chosenCategory = category;
      }
    });

    return chosenCategory;
  }

  /**
   * Build a frequency hashmap where
   * - the keys are the entries in `tokens`
   * - the values are the frequency of each entry in `tokens`
   *
   * @param  {Array} tokens  Normalized word array
   * @return {Object}
   */
  private frequencyTable(tokens: string[]): { [key: string]: number } {
    const frequencyTable = Object.create(null);

    tokens.forEach((token: string) => {
      if (!frequencyTable[token]) {
        frequencyTable[token] = 1;
      } else {
        frequencyTable[token]++;
      }
    });

    return frequencyTable;
  }

  /**
   * Calculate probability that a `token` belongs to a `category`
   *
   * @param  {String} token
   * @param  {String} category
   * @return {Number} probability
   */
  private tokenProbability(token: string, category: string): number {
    // How many times this word has occurred in documents mapped to this category
    const wordFrequencyCount = this.wordFrequencyCount[category][token] || 0;

    // What is the count of all words that have ever been mapped to this category
    const wordCount = this.wordCount[category];

    // Use laplace Add-1 Smoothing equation
    return (wordFrequencyCount + 1) / (wordCount + this.vocabularySize);
  }

  /**
   * Dump the classifier's state as a JSON string.
   * @return {String} Representation of the classifier.
   */
  public toJson(): string {
    return JSON.stringify(this);
  }

}
