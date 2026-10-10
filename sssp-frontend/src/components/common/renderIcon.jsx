import React, { isValidElement, cloneElement } from 'react';

/**
 * Renders an `icon` prop that may be supplied in either form used across the app:
 *   - a component type  -> icon={Calendar}
 *   - a React element   -> icon={<Calendar className="w-6 h-6" />}
 * Passing an element where a component type is expected (`<Icon />` with Icon = element) is what
 * triggers "Element type is invalid: expected a string ... but got: object".
 * If an element already carries its own className it is kept; otherwise `defaultClassName` is applied.
 */
const renderIcon = (icon, defaultClassName = '') => {
  if (!icon) return null;
  if (isValidElement(icon)) {
    return icon.props.className ? icon : cloneElement(icon, { className: defaultClassName });
  }
  const Icon = icon;
  return <Icon className={defaultClassName} />;
};

export default renderIcon;
