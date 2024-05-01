async function checkAttributes(example_set, attribute_set) {
  //   console.log("exampleSets", example_set, attribute_set);

  try {
    for (const example_sets of Object.keys(example_set)) {
      const { examples } = example_set[example_sets] || [];
      for (const example of examples) {
        //sending only matched examples=attribute set like search=search
        if (attribute_set[example_sets]) {
          const currentAttribute = attribute_set[example_sets];
          // if(example_sets == "on_init")
          await comapreObjects(example?.value, currentAttribute, example_sets);
        } else {
          console.log(`attribute not found for ${example_sets}`);
        }
      }
    }
  } catch (error) {
    console.log(`Error checking attributes, ${error}`);
  }
}

async function comapreObjects(examples, attributes, example_sets) {
  for (const key in examples) {
    //un-commnet this if key is not found
    //console.log('key', key, examples[key])
    if (key !== "tags")
      if (
        typeof examples[key] === "object" &&
        typeof attributes[key] === "object"
      ) {
        if (!attributes[key]) {
          console.log(`null value found for, ${key} in  ${example_sets}`);
        } else if (Array.isArray(examples[key])) {
          for (let i = 0; i < examples[key]?.length; i++) {
            const exampleItem = examples[key][i];
            const attributeItem = attributes[key];
            //use if array has no keys like: category_ids
            if (typeof exampleItem === "string" && attributeItem) {
              //found
            } else {
              await comapreObjects(exampleItem, attributeItem, example_sets);
            }
          }
        } else {
          await comapreObjects(examples[key], attributes[key], example_sets);
        }
      } else if (!attributes.hasOwnProperty(key)) {
        console.log(`keys not found, ${key} in  ${example_sets}`);
      }
  }
  console.log("Attribute validation succesful");
}

module.exports = { checkAttributes, comapreObjects };
