/*
Copyright 2017 Globo.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

import { shallow, mount, render } from 'enzyme';

import Properties from '../Properties';
import { item } from '../__fixtures__/properties.tests';


describe("Properties", function() {

  test('Render Properties page', () => {
    const wrapper = shallow(
      <Properties
        item={item} />
    );
    const element = wrapper.find('.item-prop');
    expect(element.length).toBe(1);
  });

});
