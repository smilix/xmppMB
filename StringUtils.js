// useful string util functions form the java apache commons lang:
// https://raw.github.com/apache/commons-lang/trunk/src/main/java/org/apache/commons/lang3/StringUtils.java

var StringUtils = {
  isString : function(str) {
    return typeof str === "string";
  },

  isEmpty : function(str) {
    if (!StringUtils.isString(str)) {
      return true;
    }
    return !str.length > 0;
  },

  substringBefore : function(str, separator) {
    if (StringUtils.isEmpty(str) || !StringUtils.isString(separator)) {
      return str;
    }
    if (separator.length === 0) {
      return '';
    }
    var pos = str.indexOf(separator);
    if (pos === -1) {
      return str;
    }
    return str.substring(0, pos);
  },

  /**
   * Gets the substring after the first occurrence of a separator. The separator is not returned.
   */
  substringAfter : function(str, separator) {
    if (StringUtils.isEmpty(str)) {
      return str;
    }
    if (separator == null) {
      return '';
    }
    var pos = str.indexOf(separator);
    if (pos === -1) {
      return '';
    }
    return str.substring(pos + separator.length);
  },

  /**
   * Gets the substring after the last occurrence of a separator. The separator is not returned.
   */
  substringAfterLast : function(str, separator) {
    if (StringUtils.isEmpty(str)) {
      return str;
    }
    if (StringUtils.isEmpty(separator)) {
      return '';
    }
    var pos = str.lastIndexOf(separator);
    if (pos === -1 || pos === str.length - separator.length) {
      return '';
    }
    return str.substring(pos + separator.length);
  }
};

module.exports = StringUtils;