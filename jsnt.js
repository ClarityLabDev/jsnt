const jsnt = {};

class JSNT {
    // this is layout (!)
    constructor(data) {
      this.data = data;
    }
  
    async parse() {
      if (typeof this.data === "string") {
        // Если this.data является строкой, считаем ее содержимое как JSON
        try {
          return JSON.parse(this.data);
        } catch (error) {
          console.error("Ошибка парсинга JSON-строки:", error);
          return null;
        }
      } else if (typeof this.data === "object") {
        // Если this.data является объектом, считаем его содержимое как JSON
        try {
          return this.data;
        } catch (error) {
          console.error("Ошибка парсинга JSON-объекта:", error);
          return null;
        }
      } else if (typeof this.data === "string") {
        // Если this.data является строкой, считаем ее как путь к файлу
        try {
          const response = await fetch(this.data);
          const fileContent = await response.text();
          return JSON.parse(fileContent);
        } catch (error) {
          console.error("Ошибка чтения файла или парсинга JSON:", error);
          return null;
        }
      } else {
        console.error("Некорректные данные для парсинга.");
        return null;
      }
    }
}

jsnt.get = async function (filename, callback) {
    try {
        if (filename) {
            var content = await readTxt(filename);
            var dataObject = JSON.parse(content); // Преобразуем текст в объект

            callback(dataObject); // Вызываем переданный обратный вызов с объектом
        }
    } catch (error) {
        console.log("JSNT: " + error); // Выводим ошибку, если что-то пошло не так
    }
};

const readTxt = async (linkContent) => {
    const response = await fetch(linkContent);
    const text = await response.text();
    return text;
};

jsnt.download = async function (filename, newContent = null) {
    try {
        if (filename) {
            if (!newContent) {
                // Если newContent не указан, получаем контент из файла
                newContent = await readTxt(filename);
            }

            // Создаем Blob из нового контента
            const blob = new Blob([newContent], { type: 'text/plain' });

            // Создаем ссылку на Blob
            const blobUrl = URL.createObjectURL(blob);

            // Создаем ссылку на скачивание файла с новым содержимым
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = filename;

            // Симулируем клик по ссылке для скачивания файла
            downloadLink.click();

            // Освобождаем использованный Blob
            URL.revokeObjectURL(blobUrl);
        }
    } catch (error) {
        console.log(error); // Выводим ошибку, если что-то пошло не так
    }
};

jsnt.replace = async function (filename, columnName, newValue) {
    try {
        if (filename && columnName && newValue) {
            // Получаем текущий контент файла
            const content = await readTxt(filename);

            // Преобразуем текст в объект
            const dataObject = JSON.parse(content);

            // Изменяем значение указанного столбца
            dataObject[columnName] = newValue;

            // Преобразуем объект обратно в JSON строку
            const newContent = dataObject;

            // Возвращаем полностью измененный контент файла
            return newContent;
        } else {
            throw new Error('JSNT: The parameters needed to perform the function are not specified in jsnt.replace');
        }
    } catch (error) {
        throw error;
    }
};

jsnt.remove = function (jsonData, columnName) {
    let data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    delete data[columnName];
    return data;
}

jsnt.set = function(jsonData, key, value) {
    const keys = key.split('.');
    let currentObj = jsonData;
  
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i];
      if (!currentObj.hasOwnProperty(currentKey) || typeof currentObj[currentKey] !== 'object') {
        currentObj[currentKey] = {};
      }
      currentObj = currentObj[currentKey];
    }
  
    currentObj[keys[keys.length - 1]] = value;
}

jsnt.has = function(jsonData, key) {
    const keys = key.split('.');
    let currentObj = jsonData;
  
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      if (!currentObj.hasOwnProperty(currentKey)) {
        return false;
      }
      currentObj = currentObj[currentKey];
    }
  
    return true;
}

jsnt.filter = function(jsonData, condition) {
    const filteredData = {};
  
    Object.keys(jsonData).forEach((key) => {
      const value = jsonData[key];
  
      if (condition(value)) {
        filteredData[key] = value;
      }
    });
  
    return filteredData;
}

jsnt.sort = function(jsonData, key) {
    const sortedData = {};

    Object.keys(jsonData).sort((a, b) => {
      const valueA = jsonData[a][key];
      const valueB = jsonData[b][key];
  
      if (valueA < valueB) {
        return -1;
      } else if (valueA > valueB) {
        return 1;
      } else {
        return 0;
      }
    }).forEach((sortedKey) => {
      sortedData[sortedKey] = jsonData[sortedKey];
    });
  
    return sortedData;
}

jsnt.merge = function(...jsonObjects) {
    const mergedData = {};
  
    jsonObjects.forEach((jsonObj) => {
      Object.assign(mergedData, jsonObj);
    });
  
    return mergedData;
}

jsnt.flatten = function(jsonData, parentKey = '', flattenedData = {}) {
    Object.keys(jsonData).forEach((key) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      const value = jsonData[key];
  
      if (typeof value === 'object' && value !== null) {
        jsnt.flatten(value, newKey, flattenedData);
      } else {
        flattenedData[newKey] = value;
      }
    });
  
    return flattenedData;
}

jsnt.validate = function(jsonData, schema) {
    try {
      JSON.parse(JSON.stringify(jsonData));
      return true;
    } catch (error) {
      return false;
    }
}

jsnt.count = function(jsonData) {
    return Object.keys(jsonData).length;
}

jsnt.keys = function(jsonData) {
    return Object.keys(jsonData);
}

jsnt.isEmpty = function(jsonData) {
    return Object.keys(jsonData).length === 0
}

jsnt.toString = function(jsonData) {
    return JSON.stringify(jsonData);
}

jsnt.toJson = function(jsonString) {
    return JSON.parse(jsonString);
}

jsnt.toArray = function(data) {
  return Object.values(data);
}

jsnt.sum = function(data, key) {
  const dataArray = Object.values(data);
  return dataArray.reduce((result, item) => result + item, 0); // Здесь исправление
};

jsnt.equal = function(obj1, obj2) {
    // Сравнение типов объектов
    if (typeof obj1 !== typeof obj2) {
      return false;
    }
  
    // Сравнение примитивных значений
    if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
      return obj1 === obj2;
    }
  
    // Сравнение массивов
    if (Array.isArray(obj1)) {
      if (!Array.isArray(obj2) || obj1.length !== obj2.length) {
        return false;
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!jsnt.equal(obj1[i], obj2[i])) {
          return false;
        }
      }
      return true;
    }
  
    // Сравнение объектов
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (const key of keys1) {
      if (!keys2.includes(key) || !jsnt.equal(obj1[key], obj2[key])) {
        return false;
      }
    }
  
    return true;
}

jsnt.group = function(data, key) {
    return data.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
}

jsnt.renameKey = function(obj, oldKey, newKey) {
    if (!obj.hasOwnProperty(oldKey)) {
      return obj;
    }
    const updatedObj = { ...obj };
    updatedObj[newKey] = updatedObj[oldKey];
    delete updatedObj[oldKey];
    return updatedObj;
}

jsnt.average = function(data, key) {
  var sum = jsnt.sum(data, key)
  var sumCount = jsnt.count(data, key)
  return sum / sumCount;
}

jsnt.map = function(obj, callback) {
  if (Array.isArray(obj)) {
    return obj.map(item => jsnt.map(item, callback));
  } else if (typeof obj === 'object') {
    let result = {};
    for (let key in obj) {
      result[key] = jsnt.map(obj[key], callback);
    }
    return result;
  } else if (typeof obj === 'string') {
    return callback(obj);
  } else {
    return obj;
  }
};

jsnt.date = {}

jsnt.date.convert = function(unixDate, format, timeZone = undefined) {
  const date = new Date(unixDate * 1000);

  if (timeZone) {
    const options = {
      timeZone: timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    formatter.formatToParts(); // Необходимо для некоторых браузеров, чтобы форматирование работало правильно
    const formattedDateParts = formatter.formatToParts(date);

    let formattedDate = '';
    for (const part of formattedDateParts) {
      switch (part.type) {
        case 'day':
          formattedDate += part.value.padStart(2, '0');
          break;
        case 'month':
          formattedDate += part.value.padStart(2, '0');
          break;
        case 'year':
          formattedDate += part.value;
          break;
        case 'hour':
          formattedDate += part.value.padStart(2, '0');
          break;
        case 'minute':
          formattedDate += part.value.padStart(2, '0');
          break;
        case 'second':
          formattedDate += part.value.padStart(2, '0');
          break;
      }
    }

    return format
      .replace('DD', formattedDate.slice(0, 2))
      .replace('MM', formattedDate.slice(2, 4))
      .replace('YYYY', formattedDate.slice(4, 8))
      .replace('hh', formattedDate.slice(8, 10))
      .replace('mm', formattedDate.slice(10, 12))
      .replace('ss', formattedDate.slice(12, 14));
  } else {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
    };

    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    return format
      .replace('DD', formattedDate.slice(3, 5))
      .replace('MM', formattedDate.slice(0, 2))
      .replace('YYYY', formattedDate.slice(6, 10))
      .replace('hh', formattedDate.slice(11, 13))
      .replace('mm', formattedDate.slice(14, 16))
      .replace('ss', formattedDate.slice(17, 19));
  }
}

jsnt.date.diff = function(unixDate1, unixDate2, unit = undefined) {
  const difference = Math.abs(unixDate1 - unixDate2) * 1000; // Разница в миллисекундах

  const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30.44)) % 12;
  const days = Math.floor(difference / (1000 * 60 * 60 * 24)) % 30.44;
  const hours = Math.floor(difference / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(difference / (1000 * 60));
  const seconds = Math.floor(difference / 1000);
  const milliseconds = difference;

  const result = {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };

  if (unit !== undefined) {
    return result[unit];
  }

  return result;
}

jsnt.date.add = function(unixDate, { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
  const date = new Date(unixDate * 1000);
  date.setFullYear(date.getFullYear() + years);
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  date.setSeconds(date.getSeconds() + seconds);
  return Math.floor(date.getTime() / 1000);
}

jsnt.date.substr = function(unixDate, { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
  const date = new Date(unixDate * 1000);
  date.setFullYear(date.getFullYear() - years);
  date.setMonth(date.getMonth() - months);
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  date.setSeconds(date.getSeconds() - seconds);
  return Math.floor(date.getTime() / 1000);
}

jsnt.chache = {}

let chache = {}

jsnt.chache.new = function(key, value) {
  chache[key] = value
}
jsnt.chache.add = function(key, value) {
  var existingCache = chache[key];

  if (typeof existingCache === 'string') {
    var convertedChache = JSON.parse(existingCache);
    Object.assign(convertedChache, value);
    chache[key] = JSON.stringify(convertedChache);
  } else if (typeof existingCache === 'object') {
    Object.assign(existingCache, value);
  }
}
jsnt.chache.get = function(key) {
  return chache[key]
}
jsnt.chache.remove = function(key) {
 delete chache[key]
}
jsnt.chache.clear = function(key) {
  chache = {}
}

jsnt.parseYAML = function(yamlString) {
  try {
    const lines = yamlString.split('\n');
    const data = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
        // Пропустить пустые строки и комментарии
        continue;
      }

      const [key, value] = trimmedLine.split(':').map(part => part.trim());
      data[key] = value;
    }

    return data;
  } catch (error) {
    console.error('YAML parsing error:', error);
    return null;
  }
}

jsnt.toYAML = function(data) {
  try {
    function convertObjectToYAML(obj, indentLevel = 0) {
      let yamlString = '';

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          const indent = ' '.repeat(indentLevel * 2);

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            yamlString += `${indent}${key}:\n${convertObjectToYAML(value, indentLevel + 1)}`;
          } else {
            yamlString += `${indent}${key}: ${value}\n`;
          }
        }
      }

      return yamlString;
    }

    const yamlString = convertObjectToYAML(data);
    return yamlString;
  } catch (error) {
    console.error('Error during yaml-to-json covertation:', error);
    return null;
  }
}


jsnt.parseXML = function(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const rootNode = xmlDoc.documentElement;
  const result = {};

  function parseNode(node, obj) {
    if (node.hasChildNodes()) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];
        if (childNode.nodeType === Node.ELEMENT_NODE) {
          const childObj = {};
          parseNode(childNode, childObj);
          if (obj[childNode.nodeName]) {
            if (!Array.isArray(obj[childNode.nodeName])) {
              obj[childNode.nodeName] = [obj[childNode.nodeName]];
            }
            obj[childNode.nodeName].push(childObj);
          } else {
            obj[childNode.nodeName] = childObj;
          }
        }
      }
    } else {
      obj[node.nodeName] = node.textContent;
    }
  }

  parseNode(rootNode, result);
  return result;
}

jsnt.toXML = function(data) {
  let xmlString = '';

  function createXMLNodes(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (typeof value === 'object') {
          xmlString += `<${key}>`;
          createXMLNodes(value);
          xmlString += `</${key}>`;
        } else {
          xmlString += `<${key}>${value}</${key}>`;
        }
      }
    }
  }

  xmlString += '<root>';
  createXMLNodes(data);
  xmlString += '</root>';
  
  return xmlString;
}

