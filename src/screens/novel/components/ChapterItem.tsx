import React, { memo, ReactNode, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import color from 'color';

import { Row } from '../../../components/Common';

import {
  ChapterBookmarkButton,
  DownloadButton,
} from './Chapter/ChapterDownloadButtons';
import { parseChapterNumber } from '@utils/parseChapterNumber';

import { ThemeColors } from '@theme/types';
import { ChapterItemExtended } from '@database/types';

interface ChapterItemProps {
  chapter: ChapterItemExtended;
  theme: ThemeColors;
  index?: number;
  downloadQueue: any;
  showChapterTitles: boolean;
  isSelected?: (chapterId: number) => boolean;
  downloadChapter: (chapter: ChapterItemExtended) => (dispatch: any) => void;
  deleteChapter: (chapter: ChapterItemExtended) => void;
  onSelectPress?: (chapter: ChapterItemExtended, arg1: () => void) => void;
  onSelectLongPress?: (chapter: ChapterItemExtended) => void;
  navigateToChapter: (chapter: ChapterItemExtended) => void;
  showProgressPercentage?: (chapter: ChapterItemExtended) => void;
  left?: ReactNode;

  isUpdateCard?: boolean;
  novelName?: string;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  theme,
  index,
  showChapterTitles,
  downloadQueue,
  downloadChapter,
  deleteChapter,
  isSelected,
  onSelectPress,
  onSelectLongPress,
  navigateToChapter,
  showProgressPercentage,
  left,
  isUpdateCard,
  novelName,
}) => {
  const { chapterId, chapterName, read, releaseDate, bookmark } = chapter;
  const [deleteChapterMenuVisible, setDeleteChapterMenuVisible] =
    useState(false);
  const showDeleteChapterMenu = () => setDeleteChapterMenuVisible(true);
  const hideDeleteChapterMenu = () => setDeleteChapterMenuVisible(false);
  const chapterNumber = parseChapterNumber(chapterName);

  return (
    <Pressable
      key={chapterId.toString()}
      style={[
        styles.chapterCardContainer,
        isSelected?.(chapterId) && {
          backgroundColor: color(theme.primary).alpha(0.12).string(),
        },
      ]}
      onPress={() => {
        onSelectPress
          ? onSelectPress(chapter, () => navigateToChapter(chapter))
          : navigateToChapter(chapter);
      }}
      onLongPress={() => onSelectLongPress?.(chapter)}
      android_ripple={{ color: theme.rippleColor }}
    >
      {left && <View style={styles.flex}>{left}</View>}
      <Row style={styles.row}>
        {!!bookmark && <ChapterBookmarkButton theme={theme} />}
        <View style={styles.textContainer}>
          {isUpdateCard && (
            <Text
              style={[
                {
                  fontSize: 14,
                  color: read ? theme.outline : theme.onSurface,
                },
              ]}
              numberOfLines={1}
            >
              {novelName}
            </Text>
          )}
          <Text
            style={[
              {
                fontSize: isUpdateCard ? 12 : 14,
                color: read
                  ? theme.outline
                  : bookmark
                  ? theme.primary
                  : theme.onSurfaceVariant,
              },
            ]}
            numberOfLines={1}
          >
            {showChapterTitles
              ? chapterNumber
                ? 'Chapter ' + chapterNumber
                : 'Chapter ' + index
              : chapterName}
          </Text>
          <View style={styles.textRow}>
            {releaseDate && !isUpdateCard ? (
              <Text
                style={[
                  {
                    color: read
                      ? theme.outline
                      : bookmark
                      ? theme.primary
                      : theme.onSurfaceVariant,
                  },
                  styles.text,
                ]}
                numberOfLines={1}
              >
                {releaseDate}
              </Text>
            ) : null}
            {showProgressPercentage?.(chapter)}
          </View>
        </View>
      </Row>
      <View style={styles.flex}>
        <DownloadButton
          downloadQueue={downloadQueue}
          chapter={chapter}
          theme={theme}
          deleteChapter={deleteChapter}
          downloadChapter={downloadChapter}
          hideDeleteChapterMenu={hideDeleteChapterMenu}
          showDeleteChapterMenu={showDeleteChapterMenu}
          deleteChapterMenuVisible={deleteChapterMenuVisible}
        />
      </View>
    </Pressable>
  );
};

export default memo(ChapterItem);

const styles = StyleSheet.create({
  chapterCardContainer: {
    height: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGab: 8,
  },
  text: {
    fontSize: 12,
  },
  textRow: {
    flexDirection: 'row',
  },
  flex: {
    flexBasis: 'auto',
    flexShrink: 9,
  },
  textContainer: {
    flex: 1,
    marginVertical: '10%',
    height: '80%',
    justifyContent: 'space-evenly',
  },
  row: {
    flexBasis: 10,
    flexGrow: 1,
    overflow: 'hidden',
    height: '100%',
  },
});
