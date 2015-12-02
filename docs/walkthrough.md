If using browserify with riotify
```
import View from 'frontend-view';
import tag from '../path/to/a.tag';

const SomeView = View({
  tag
});
```

if not using browserify

```
View.riot.compile('/tags/hello-world.tag', function() {
  // the loaded tags are ready to be used
  window.UserView = View({
    tag: 'hello-world'
  });
});
```

for a full specification of the {@link View} class please refer to it's documentation.