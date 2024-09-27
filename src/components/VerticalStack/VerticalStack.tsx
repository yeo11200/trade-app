import React, {ReactNode} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface VerticalStackProps {
  children: ReactNode;
  spacing?: number;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
}

const VerticalStack: React.FC<VerticalStackProps> = ({
  children,
  spacing = 10,
  style,
  itemStyle = {},
}) => {
  return (
    <View style={[styles.vertical, style]}>
      {React.Children.map(children, (child, index) => (
        <View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              marginBottom:
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
  vertical: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
});

export default VerticalStack;
