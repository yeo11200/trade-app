import React, {ReactNode} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface HorizontalStackProps {
  children: ReactNode;
  spacing?: number;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
}

const HorizontalStack: React.FC<HorizontalStackProps> = ({
  children,
  spacing = 10,
  style,
  itemStyle = {},
}) => {
  return (
    <View style={[styles.horizontal, style]}>
      {React.Children.map(children, (child, index) => (
        <View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              marginRight:
                index === React.Children.count(children) - 1 ? 0 : spacing,
            },
            itemStyle,
          ]}>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

export default HorizontalStack;
