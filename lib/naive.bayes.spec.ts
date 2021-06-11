import { NaiveBayes } from './naive.bayes';

describe('Test NaiveBayes', () => {

  describe('bayes() init', () => {
    it('valid options (falsey or with an object) do not raise Errors', () => {
      const validOptionsCases = [undefined, {}];

      validOptionsCases.forEach(function(validOptions) {
        const classifier = new NaiveBayes(validOptions);
        expect(classifier.options).toEqual({});
      });
    });
  });

  describe('bayes using custom tokenizer', () => {
    it('uses custom tokenization function if one is provided in `options`.', done => {
      const splitOnChar = (text: string) => text.split('');

      const classifier = new NaiveBayes({ tokenizer: splitOnChar });

      classifier.learn('abcd', 'happy');

      // Check classifier's state is as expected
      expect(classifier.totalDocuments).toEqual(1);
      expect(classifier.docCount.happy).toEqual(1);
      expect(classifier.vocabulary).toEqual({ a: true, b: true, c: true, d: true });
      expect(classifier.vocabularySize).toEqual(4);
      expect(classifier.wordCount.happy).toEqual(4);
      expect(classifier.wordFrequencyCount.happy.a).toEqual(1);
      expect(classifier.wordFrequencyCount.happy.b).toEqual(1);
      expect(classifier.wordFrequencyCount.happy.c).toEqual(1);
      expect(classifier.wordFrequencyCount.happy.d).toEqual(1);
      expect(classifier.categories).toEqual({ happy: true });

      done();
    });
  });

  describe('bayes serializing/deserializing its state', () => {
    it('serializes/deserializes its state as JSON correctly.', async () => {
      const classifier = new NaiveBayes();

      classifier.learn('Fun times were had by all', 'positive');
      classifier.learn('sad dark rainy day in the cave', 'negative');

      const jsonRepr = classifier.toJson();

      const revivedClassifier = NaiveBayes.fromJson(jsonRepr);

      expect(classifier).toEqual(revivedClassifier);
    });

    it('allows de-serializing an empty state', function(done) {
      const classifier = new NaiveBayes();
      const jsonRepr = classifier.toJson();
      NaiveBayes.fromJson(jsonRepr);
      done();
    });

  });

  describe('Learn correctness', () => {
    // Sentiment analysis specs
    it('Categorizes correctly for `positive` and `negative` categories', async () => {
      const classifier = new NaiveBayes();

      // Teach it positive phrases
      classifier.learn('amazing, awesome movie!! Yeah!!', 'positive');
      classifier.learn('Sweet, this is incredibly, amazing, perfect, great!!', 'positive');

      // Teach it a negative phrase
      classifier.learn('terrible, shitty thing. Damn. Sucks!!', 'negative');

      // Teach it a neutral phrase
      classifier.learn('I dont really know what to make of this.', 'neutral');

      // Now specs it to see that it correctly categorizes a new document
      expect(classifier.categorize('awesome, cool, amazing!! Yay.')).toEqual('positive');
    });

    // Topic analysis specs
    it('Categorizes correctly for `chinese` and `japanese` categories', async () => {
      const classifier = new NaiveBayes();

      // Teach it how to identify the `chinese` category
      classifier.learn('Chinese Beijing Chinese', 'chinese');
      classifier.learn('Chinese Chinese Shanghai', 'chinese');
      classifier.learn('Chinese Macao', 'chinese');

      // Teach it how to identify the `japanese` category
      classifier.learn('Tokyo Japan Chinese', 'japanese');

      // Make sure it learned the `chinese` category correctly
      const chineseFrequencyCount = classifier.wordFrequencyCount.chinese;

      expect(chineseFrequencyCount['Chinese']).toEqual(5);
      expect(chineseFrequencyCount['Beijing']).toEqual(1);
      expect(chineseFrequencyCount['Shanghai']).toEqual(1);
      expect(chineseFrequencyCount['Macao']).toEqual(1);

      // Make sure it learned the `japanese` category correctly
      const japaneseFrequencyCount = classifier.wordFrequencyCount.japanese;

      expect(japaneseFrequencyCount['Tokyo']).toEqual(1);
      expect(japaneseFrequencyCount['Japan']).toEqual(1);
      expect(japaneseFrequencyCount['Chinese']).toEqual(1);

      // Now specs it to see that it correctly categorizes a new document
      expect(classifier.categorize('Chinese Chinese Chinese Tokyo Japan')).toEqual('chinese');
    });

    it('Correctly tokenizes Cyrillic characters', async () => {
      const classifier = new NaiveBayes();

      classifier.learn('Надежда за', 'a');
      classifier.learn('Надежда за обич еп.36 Тест', 'b');
      classifier.learn('Надежда за обич еп.36 Тест', 'b');

      const aFreqCount = classifier.wordFrequencyCount.a;
      expect(aFreqCount['Надежда']).toEqual(1);
      expect(aFreqCount['за']).toEqual(1);

      const bFreqCount = classifier.wordFrequencyCount.b;
      expect(bFreqCount['Надежда']).toEqual(2);
      expect(bFreqCount['за']).toEqual(2);
      expect(bFreqCount['обич']).toEqual(2);
      expect(bFreqCount['еп']).toEqual(2);
      expect(bFreqCount['36']).toEqual(2);
      expect(bFreqCount['Тест']).toEqual(2);
    });
  });

});
