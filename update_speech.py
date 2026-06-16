import re

with open(r'd:\presentator\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_func = r'''function verbalizeMathForSpeech(text) {
  const isEnglishMode = state.subjectMode === "english";

  let mathText = expandTeachingTermsForSpeech(text);

  if (isEnglishMode) {
    return mathText
      .replace(/=/g, " ")
      .replace(/\+/g, " ")
      .replace(/(?<!\d)-(?=\d)/g, " ")
      .replace(/(?<=\d)\s*-\s*(?=\d)/g, " ")
      .replace(/\s+-\s+/g, " ")
      .replace(/\*/g, " ")
      .replace(/\u00D7/g, " ")
      .replace(/\u00F7/g, " ")
      .replace(/\//g, " ")
      .replace(/</g, " ")
      .replace(/>/g, " ")
      .replace(/\u2264/g, " ")
      .replace(/\u2265/g, " ")
      .replace(/\u2260/g, " ")
      .replace(/%/g, " ")
      .replace(/\^/g, " ")
      .replace(/\u221A/g, " ")
      .replace(/:/g, " ")
      .replace(/\(/g, " ")
      .replace(/\)/g, " ")
      .replace(/\[/g, " ")
      .replace(/\]/g, " ")
      .replace(/\{/g, " ")
      .replace(/\}/g, " ")
      .replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return mathText
    .replace(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g, verbalizeFractionToken)
    .replace(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/g, "$1 is to $2")
    .replace(/\*/g, " multiplied by ")
    .replace(/(\d+(?:,\d+)*(?:\.\d+)?)/g, (match) => convertDecimalNumberToWords(match))
    .replace(/\u00D7/g, " multiplied by ")
    .replace(/\u00F7/g, " divided by ")
    .replace(/\//g, " divided by ")
    .replace(/\+/g, " plus ")
    .replace(/(?<!\d)-(?=\d)/g, " minus ")
    .replace(/(?<=\d)\s*-\s*(?=\d)/g, " minus ")
    .replace(/\s+-\s+/g, " minus ")
    .replace(/=/g, " equal to ")
    .replace(/\u2264/g, " less than or equal to ")
    .replace(/\u2265/g, " greater than or equal to ")
    .replace(/\u2260/g, " not equal to ")
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/\^/g, " to the power of ")
    .replace(/%/g, " percent ")
    .replace(/\u221A/g, " square root of ")
    .replace(/\(/g, " open bracket ")
    .replace(/\)/g, " close bracket ")
    .replace(/\[/g, " open square bracket ")
    .replace(/\]/g, " close square bracket ")
    .replace(/\{/g, " open curly bracket ")
    .replace(/\}/g, " close curly bracket ")
    .replace(/\s+/g, " ")
    .trim();
}'''

pattern = r'function verbalizeMathForSpeech\(text\) \{.*?\.trim\(\);\n\}'
new_content = re.sub(pattern, lambda m: new_func, content, flags=re.DOTALL)

with open(r'd:\presentator\script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Replaced successfully")
