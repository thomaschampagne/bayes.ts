# TypeScript Naive Bayes Classifier for Node and Browser

This "Naive Bayes Classifier" library is based on the [bayes](https://www.npmjs.com/package/bayes) package. Library has been re-implemented as synchronous, refactored and cleaned under TypeScript, Jest, ESLint and Prettier.

## What can I use this for?

You can use this for categorizing any text content into any arbitrary set of **categories**. For example:

- is an email **spam**, or **not spam** ?
- is a news article about **technology**, **politics**, or **sports** ?
- is a piece of text expressing **positive** emotions, or **negative** emotions?

## Installing

```bash
npm install naive-bayes
```

## Usage

```typescript
import { NaiveBayes }  from "naive-bayes";

const classifier = new NaiveBayes();

// Teach it positive phrases
classifier.learn('amazing, awesome movie!! Yeah!! Oh boy.', 'positive');
classifier.learn('Sweet, this is incredibly, amazing, perfect, great!!', 'positive');

// Teach it a negative phrase
classifier.learn('terrible, shitty thing. Damn. Sucks!!', 'negative');

// Now ask it to categorize a document it has never seen before
console.log(classifier.categorize('awesome, cool, amazing!! Yay.')); // => 'positive'

// Serialize the classifier's state as a JSON string.
const model = classifier.toJson();

// Load the classifier back from its JSON representation.
const revivedClassifier = NaiveBayes.fromJson(model);

console.log(revivedClassifier.categorize('Damn')); // => 'negative'

```

## API

### `const classifier = new NaiveBayes([options])`

Returns an instance of a Naive-Bayes Classifier.

Pass in an optional `options` object to configure the instance. If you specify a `tokenizer` function in `options`, it will be used as the instance's tokenizer. It receives a (string) `text` argument - this is the string value that is passed in by you when you call `.learn()` or `.categorize()`. It must return an array of tokens. The default tokenizer removes punctuation and splits on spaces.

Eg.

```typescript
const classifier = new NaiveBayes({
    tokenizer: text => { return text.split(' ') }
})
```

### `classifier.learn(text, category)`

Teach your classifier what `category` the `text` belongs to. The more you teach your classifier, the more reliable it becomes. It will use what it has learned to identify new documents that it hasn't seen before.

### `classifier.categorize(text)`

Returns the `category` it thinks `text` belongs to. Its judgement is based on what you have taught it with **.learn()**.

### `classifier.probabilities(text)`

Returns an array of `{ value, category }` objects with probability calculated for each category. Its judgement is based on what you have taught it with **.learn()**.

### `classifier.toJson()`

Returns the JSON representation of a classifier.

### `var classifier = NaiveBayes.fromJson(jsonStr)`

Returns a classifier instance from the JSON representation. Use this with the JSON representation obtained from `classifier.toJson()`
