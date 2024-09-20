import { ScrollView, Text, Image, TextInput, TouchableOpacity, View, ActivityIndicator, FlatList } from 'react-native';
import React, { useRef, useState, useCallback, useEffect } from 'react';


//  Not complete yet full component

const CustomFlatList = ({ data, maxLimit, ReturnItem, loadData, }) => {

    const [Page, setPage] = useState(1);
    const [Limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [AllDataFetched, setAllDataFetched] = useState(false);

    const HandleRefresh = () => {
        setPage(1);

        loadData({ page: Page, limit: Limit, isRefresh: true });
    }
    const HandleLoadMore = () => {
        if (isRefreshing || AllDataFetched) return;

        setPage(FilterPage + 1);
        loadData({ page: Page, limit: Limit, loadmore: true });
    }
    const RenderFlooter = () => isRefreshing && <ActivityIndicator animating size="large" />

    return (
        <FlatList
            data={data}
            renderItem={({ item }) => <ReturnItem data={item} />}
            keyExtractor={(item, idx) => `custom-flatlist-${idx}`}
            refreshing={isRefreshing}
            onRefresh={HandleRefresh}
            onEndReached={HandleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={RenderFlooter}
        />
    )
}